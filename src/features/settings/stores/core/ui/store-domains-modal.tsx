/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormModal } from "@/shared/ui/form-modal";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { P } from "@/shared/ui/typography";
import { cn } from "@/lib/utils";

import { useStoreDomains } from "../hooks/use-store-domains";
import { Store } from "../types/store.type";

// ✅ set your base domain here
const BASE_DOMAIN = "centa.africa";

// same strict host regex you used earlier (supports multi-label TLDs)
const HOST_REGEX =
  /^(?=.{1,253}$)(?!-)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

export type StoreDomainsModalProps = {
  open: boolean;
  store: Store | null;
  onClose: () => void;
};

const DomainSchema = z.object({
  // ✅ store only the subdomain label in the form
  primarySubdomain: z
    .string()
    .trim()
    .min(1, "Subdomain is required")
    .max(63, "Subdomain is too long")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/i,
      "Use letters, numbers, and hyphens only"
    ),
  extraDomains: z.string().optional(),
});

type DomainFormValues = z.infer<typeof DomainSchema>;

function normalizeDomain(input: string) {
  let s = (input || "").trim().toLowerCase();
  s = s.replace(/^https?:\/\//, "");
  s = s.split("/")[0].split("?")[0].split("#")[0];
  s = s.split(":")[0];
  if (s.endsWith(".")) s = s.slice(0, -1);
  if (s.startsWith("www.")) s = s.slice(4);
  return s;
}

function normalizeSubdomainLabel(input: string) {
  return (input || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

function uniqueNonEmpty(arr: string[]) {
  const set = new Set<string>();
  for (const a of arr) {
    const v = normalizeDomain(a);
    if (!v) continue;
    set.add(v);
  }
  return Array.from(set);
}

function domainsSignature(domains: any[]) {
  return (domains ?? [])
    .filter((d) => !d?.deletedAt)
    .map((d) => `${normalizeDomain(d?.domain ?? "")}|${d?.isPrimary ? 1 : 0}`)
    .sort()
    .join(",");
}

// Extract the "label" from a primary domain if it matches BASE_DOMAIN
function extractSubdomainFromPrimary(primary: string) {
  const full = normalizeDomain(primary);
  const suffix = `.${BASE_DOMAIN}`;
  if (!full) return "";
  if (full === BASE_DOMAIN) return ""; // no subdomain
  if (full.endsWith(suffix)) {
    return full.slice(0, -suffix.length); // "example" from "example.centa.africa"
  }
  // fallback: if they have some other primary, show the full as a best-effort label
  return full;
}

export function StoreDomainsModal({
  open,
  store,
  onClose,
}: StoreDomainsModalProps) {
  const storeId = store?.id ?? null;

  const { domains, isLoading, fetchError, updateDomains, isSaving, saveError } =
    useStoreDomains(storeId);

  const form = useForm<DomainFormValues>({
    resolver: zodResolver(DomainSchema),
    defaultValues: { primarySubdomain: "", extraDomains: "" },
    mode: "onChange",
  });

  const [submitError, setSubmitError] = useState<string | null>(null);

  const currentPrimary = useMemo(() => {
    const primary = domains.find((d) => d.isPrimary && !d.deletedAt)?.domain;
    if (primary) return primary;
    const first = domains.find((d) => !d.deletedAt)?.domain;
    return first ?? "";
  }, [domains]);

  const currentExtras = useMemo(() => {
    const extras = domains
      .filter((d) => !d.deletedAt)
      .filter(
        (d) => normalizeDomain(d.domain) !== normalizeDomain(currentPrimary)
      )
      .map((d) => d.domain);
    return extras;
  }, [domains, currentPrimary]);

  const lastResetSigRef = useRef<string>("");

  useEffect(() => {
    if (!open) return;
    if (!storeId) return;

    const sig = `${storeId}::${domainsSignature(domains)}`;
    if (lastResetSigRef.current === sig) return;
    lastResetSigRef.current = sig;

    const sub = currentPrimary
      ? extractSubdomainFromPrimary(currentPrimary)
      : "";

    form.reset({
      primarySubdomain: normalizeSubdomainLabel(sub),
      extraDomains: currentExtras.map(normalizeDomain).join("\n"),
    });
  }, [open, storeId, domains, currentPrimary, currentExtras, form]);

  useEffect(() => {
    if (open) return;
    lastResetSigRef.current = "";
  }, [open]);

  const primarySubdomain = useWatch({
    control: form.control,
    name: "primarySubdomain",
  });

  const primaryFullHost = useMemo(() => {
    const sub = normalizeSubdomainLabel(primarySubdomain || "");
    return sub ? `${sub}.${BASE_DOMAIN}` : "";
  }, [primarySubdomain]);

  const onSubmit = async (values: DomainFormValues) => {
    setSubmitError(null);
    if (!storeId) return;

    const sub = normalizeSubdomainLabel(values.primarySubdomain);
    const primary = sub ? `${sub}.${BASE_DOMAIN}` : "";

    // extra domains: host-only list, normalized + deduped
    const extras = uniqueNonEmpty((values.extraDomains ?? "").split("\n"));

    // ensure primary not duplicated in extras
    const filteredExtras = extras.filter(
      (d) => normalizeDomain(d) !== normalizeDomain(primary)
    );

    // final safety: primary must be a valid host per HOST_REGEX
    if (!primary || !HOST_REGEX.test(primary)) {
      setSubmitError(
        `Primary domain must be a valid host like "example.${BASE_DOMAIN}".`
      );
      return;
    }

    const payload = {
      domains: [
        { domain: primary, isPrimary: true },
        ...filteredExtras.map((d) => ({
          domain: normalizeDomain(d),
          isPrimary: false,
        })),
      ],
    };

    try {
      await updateDomains(payload as any);
      onClose();
    } catch (e: any) {
      console.log(e);
      setSubmitError(
        e?.response?.data?.error?.message ?? "Failed to update domains"
      );
    }
  };

  const handleClose = () => {
    setSubmitError(null);
    onClose();
  };

  return (
    <FormModal
      open={open}
      mode={"edit"}
      title={store ? `Domains — ${store.name}` : "Domains"}
      onClose={handleClose}
      onSubmit={form.handleSubmit(onSubmit)}
      isSubmitting={isSaving}
      submitLabel={isSaving ? "Saving..." : "Save domains"}
    >
      <Form {...form}>
        <div className="space-y-4">
          {isLoading ? (
            <P className="text-sm text-muted-foreground">Loading domains…</P>
          ) : fetchError ? (
            <P className="text-sm text-destructive">
              Failed to load domains: {fetchError}
            </P>
          ) : null}

          {/* Primary domain as subdomain input */}
          <FormField
            control={form.control}
            name="primarySubdomain"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Primary domain</FormLabel>

                <FormControl>
                  <div className="flex items-stretch rounded-lg border bg-muted/20 overflow-hidden">
                    <Input
                      placeholder="e.g. mybrand"
                      value={field.value ?? ""}
                      className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                      onChange={(e) =>
                        field.onChange(normalizeSubdomainLabel(e.target.value))
                      }
                      onBlur={() => field.onBlur()}
                    />
                    <div className="flex items-center px-3 text-sm text-muted-foreground border-l bg-background">
                      .{BASE_DOMAIN}
                    </div>
                  </div>
                </FormControl>

                <P className="text-sm text-muted-foreground mt-1">
                  Your storefront will resolve at{" "}
                  <span className="font-medium">subdomain.{BASE_DOMAIN}</span>.
                </P>

                <FormMessage />
              </FormItem>
            )}
          />

          {/* Extra domains */}
          <FormField
            control={form.control}
            name="extraDomains"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional domains (optional)</FormLabel>
                <FormControl>
                  <textarea
                    className={cn(
                      "min-h-[110px] w-full rounded-md border bg-background px-3 py-2 text-sm",
                      "focus:outline-none focus:ring-2 focus:ring-ring"
                    )}
                    placeholder={"mystore.com\nshop.mystore.com"}
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <P className="text-sm text-muted-foreground mt-1">
                  One per line. We’ll normalize (remove https://, www, paths)
                  and dedupe automatically.
                </P>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Live preview */}
          <div className="rounded-lg border bg-muted/30 p-3 text-xs">
            <div className="font-semibold mb-1">What will be saved</div>
            <div>
              <span className="text-muted-foreground">Primary:</span>{" "}
              <span className="font-medium">
                {primaryFullHost || `— (subdomain.${BASE_DOMAIN})`}
              </span>
            </div>
          </div>

          {(saveError || submitError) && (
            <P className="text-sm text-destructive">
              {submitError ?? saveError}
            </P>
          )}
        </div>
      </Form>
    </FormModal>
  );
}
