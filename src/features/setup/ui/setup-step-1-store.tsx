/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  SetupStoreSchema,
  SetupStoreFormValues,
} from "../schema/setup-store.schema";
import { normalizeHost } from "../lib/domain";
import { useCreateStoreWithDomains } from "../hooks/use-setup";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/lib/utils";
import { slugify } from "@/shared/utils/slugify";
import { Checkbox } from "@/shared/ui/checkbox";

type Props = {
  onSuccess: (storeId: string) => void;
};

const currencyMeta = {
  GBP: { label: "GBP", symbol: "£", flag: "🇬🇧" },
  USD: { label: "USD", symbol: "$", flag: "🇺🇸" },
  CAD: { label: "CAD", symbol: "$", flag: "🇨🇦" },
} as const;

type SupportedCurrency = keyof typeof currencyMeta;
const BASE_DOMAIN = "centa.africa"; // ✅ change this to your real base domain

export function SetupStep1Store({ onSuccess }: Props) {
  const createStore = useCreateStoreWithDomains();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<SetupStoreFormValues>({
    resolver: zodResolver(SetupStoreSchema),
    defaultValues: {
      name: "",
      slug: "",
      defaultCurrency: "NGN",
      defaultLocale: "en-NG",
      isActive: true,
      domains: [{ domain: "", isPrimary: true }],
      supportedCurrencies: [],
      // ✅ new fields
      companySize: undefined,
      industry: "",
      useCase: undefined,
    },
    mode: "onSubmit",
  });

  const isSubmitting = form.formState.isSubmitting;

  // Auto-generate slug from name (until user edits slug manually)
  const watchedName = useWatch({ control: form.control, name: "name" });
  const watchedIndustry = useWatch({ control: form.control, name: "industry" });

  useEffect(() => {
    const next = slugify(watchedName || "");
    form.setValue("slug", next, { shouldDirty: true, shouldValidate: true });
  }, [watchedName, form]);

  const onSubmit = async (values: SetupStoreFormValues) => {
    setSubmitError(null);

    // Clean + enforce primary in payload
    const cleaned: any = {
      ...values,
      slug: values.slug?.trim() || slugify(values.name),

      domains: (values.domains || [])
        .map((d) => ({
          domain: normalizeHost(d.domain),
          isPrimary: !!d.isPrimary,
        }))
        .filter((d) => !!d.domain),
    };

    // Ensure one primary
    if (
      cleaned.domains.length > 0 &&
      !cleaned.domains.some((d: any) => d.isPrimary)
    ) {
      cleaned.domains[0].isPrimary = true;
    }
    if (cleaned.domains.filter((d: any) => d.isPrimary).length > 1) {
      const first = cleaned.domains.findIndex((d: any) => d.isPrimary);
      cleaned.domains = cleaned.domains.map((d: any, i: number) => ({
        ...d,
        isPrimary: i === first,
      }));
    }

    // Normalize optional fields (avoid sending empty strings)
    if (!cleaned.industry || !String(cleaned.industry).trim()) {
      delete cleaned.industry;
    } else {
      cleaned.industry = String(cleaned.industry).trim();
    }
    if (!cleaned.companySize) delete cleaned.companySize;
    if (!cleaned.useCase) delete cleaned.useCase;

    try {
      const res: any = await createStore(cleaned, () => setSubmitError(null));
      const storeId = res?.store?.id ?? res?.data?.store?.id;
      if (storeId) onSuccess(storeId);
    } catch (e: any) {
      setSubmitError(e?.message ?? "Failed to create store");
    }
  };

  return (
    <div>
      <div className="space-y-2 my-10">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-lg font-semibold">Create your store</div>
            <div className="text-sm text-muted-foreground">
              Add your store name and at least one domain. Company details help
              tailor your experience.
            </div>
          </div>
          <Badge variant="secondary">Step 1</Badge>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
          <div className="space-y-10">
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Store name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Serene Store"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormDescription>
                      This is what customers will see on your storefront.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Default currency (locked) */}
              <FormField
                control={form.control}
                name="defaultCurrency"
                render={() => (
                  <FormItem>
                    <FormLabel>Default currency</FormLabel>

                    <FormControl>
                      <div className="relative">
                        {/* Flag */}
                        <div
                          className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-lg"
                          aria-hidden="true"
                        >
                          🇳🇬
                        </div>
                        <Input value="NGN" disabled className="pl-10" />
                      </div>
                    </FormControl>

                    <FormDescription>
                      Base currency is locked to NGN.
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="defaultLocale"
                render={({ field }) => (
                  <FormItem className="md:col-span-1">
                    <div>
                      <FormLabel>Default locale</FormLabel>
                    </div>
                    <FormControl>
                      <Input value={field.value ?? "en-NG"} disabled />
                    </FormControl>
                    <FormDescription>Controls formatting</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-3 max-w-2xl">
              <FormField
                control={form.control}
                name={"domains.0.domain" as any}
                render={({ field }) => {
                  const full = String(field.value ?? "");
                  const suffix = `.${BASE_DOMAIN}`;
                  const shownSubdomain = full.endsWith(suffix)
                    ? full.slice(0, -suffix.length)
                    : full; // fallback if it's not in the expected format

                  const setFullHost = (subRaw: string) => {
                    const sub = subRaw
                      .toLowerCase()
                      .trim()
                      .replace(/\s+/g, "-")
                      .replace(/[^a-z0-9-]/g, "")
                      .replace(/-+/g, "-")
                      .replace(/^-+/, "")
                      .replace(/-+$/, "");

                    const nextFull = sub ? `${sub}.${BASE_DOMAIN}` : "";
                    field.onChange(nextFull);

                    // always keep primary true (since you want only one)
                    form.setValue("domains.0.isPrimary" as any, true, {
                      shouldDirty: true,
                      shouldValidate: false,
                    });
                  };

                  return (
                    <FormItem>
                      <FormLabel>Domain</FormLabel>
                      <FormDescription className="text-sm">
                        Choose a subdomain. Your store will be available at{" "}
                        <span className="font-medium">
                          subdomain.{BASE_DOMAIN}
                        </span>
                      </FormDescription>

                      <FormControl>
                        <div className="flex w-[60%] items-stretch rounded-lg border bg-muted/20 overflow-hidden">
                          <Input
                            value={shownSubdomain}
                            placeholder="e.g. example"
                            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                            onChange={(e) => setFullHost(e.target.value)}
                            onBlur={() => {
                              field.onBlur();
                              // normalize full host (optional but safe)
                              const normalized = normalizeHost(
                                String(
                                  form.getValues("domains.0.domain" as any) ??
                                    ""
                                )
                              );
                              form.setValue(
                                "domains.0.domain" as any,
                                normalized,
                                {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                }
                              );
                            }}
                          />
                          <div className="flex items-center px-3 text-sm text-white border-l bg-primary font-bold">
                            .{BASE_DOMAIN}
                          </div>
                        </div>
                      </FormControl>

                      {/* preview uses the stored value (full host) */}
                      {field.value ? (
                        <div className="mt-1 text-lg text-muted-foreground">
                          Your store will be at:{" "}
                          <span className="font-bold text-primary">
                            {String(field.value)}
                          </span>
                        </div>
                      ) : null}

                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>
            {/* Currency section */}

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <FormField
                control={form.control}
                name={"supportedCurrencies" as any}
                render={({ field }) => {
                  const options: SupportedCurrency[] = ["GBP", "USD", "CAD"];

                  const current: SupportedCurrency[] = Array.isArray(
                    field.value
                  )
                    ? field.value
                    : [];

                  const toggle = (
                    code: SupportedCurrency,
                    checked: boolean
                  ) => {
                    const next = checked
                      ? Array.from(new Set([...current, code]))
                      : current.filter((x) => x !== code);
                    field.onChange(next);
                  };

                  return (
                    <FormItem className="md:col-span-2 space-y-2">
                      <div>
                        <FormLabel>Additional currencies</FormLabel>
                        <FormDescription>
                          Optional. Select extra currencies to support (display
                          or future payments).
                        </FormDescription>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {options.map((code) => {
                          const meta = currencyMeta[code];
                          const checked = current.includes(code);

                          return (
                            <label
                              key={code}
                              className={cn(
                                "group flex items-center justify-between rounded-xl border px-3 py-3 text-sm cursor-pointer select-none",
                                "transition-colors hover:bg-muted/40",
                                checked
                                  ? "border-primary ring-1 ring-primary/30"
                                  : ""
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={cn(
                                    "flex h-9 w-9 items-center justify-center text-lg",
                                    checked ? "border-primary/40" : ""
                                  )}
                                  aria-hidden="true"
                                >
                                  {meta.flag}
                                </div>

                                <div className="leading-tight">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">
                                      {meta.label}
                                    </span>
                                    <span className="text-muted-foreground">
                                      {meta.symbol}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Checkbox
                                  checked={checked}
                                  onCheckedChange={(v) => toggle(code, !!v)}
                                  aria-label={`Toggle ${meta.label}`}
                                />
                              </div>
                            </label>
                          );
                        })}
                      </div>

                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>
          </div>
          {/* Company details */}
          <div className="space-y-8">
            {/* Company size chips (full width) */}
            <FormField
              control={form.control}
              name="companySize"
              render={({ field }) => {
                const options = [
                  { value: "solo", label: "Solo" },
                  { value: "2-10", label: "2–10" },
                  { value: "11-50", label: "11–50" },
                  { value: "51-200", label: "51–200" },
                  { value: "200+", label: "200+" },
                ] as const;

                return (
                  <FormItem>
                    <FormLabel>Company size</FormLabel>
                    <FormDescription>
                      Choose the closest range. This helps personalize your
                      setup.
                    </FormDescription>

                    <div className="flex flex-wrap gap-3 pt-1">
                      {options.map((opt) => {
                        const checked = field.value === opt.value;
                        return (
                          <label
                            key={opt.value}
                            className={cn(
                              "flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer select-none",
                              checked ? "border-primary" : ""
                            )}
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(v) => {
                                if (v) field.onChange(opt.value);
                                else field.onChange(undefined);
                              }}
                            />
                            <span>{opt.label}</span>
                          </label>
                        );
                      })}
                    </div>

                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            {/* Industry + Use case */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              {/* Industry */}
              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <FormDescription>
                      Pick the closest match. Choose “Other” to type yours.
                    </FormDescription>

                    <Select
                      value={field.value ?? ""}
                      onValueChange={(v) => field.onChange(v || undefined)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select…" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="fashion">Fashion</SelectItem>
                        <SelectItem value="food">Food</SelectItem>
                        <SelectItem value="beauty">Beauty</SelectItem>
                        <SelectItem value="electronics">Electronics</SelectItem>
                        <SelectItem value="home">Home & Living</SelectItem>
                        <SelectItem value="services">Services</SelectItem>
                        <SelectItem value="health">Health</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>

                    {watchedIndustry === "other" ? (
                      <div className="mt-2">
                        <FormField
                          control={form.control}
                          name={"industryOther" as any}
                          render={({ field: otherField }) => (
                            <FormItem>
                              <FormLabel className="sr-only">
                                Other industry
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Type your industry…"
                                  {...otherField}
                                  value={otherField.value ?? ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ) : null}

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Use case (auto-align when industryOther appears) */}
              <div className={watchedIndustry === "other" ? "md:pt-16" : ""}>
                <FormField
                  control={form.control}
                  name="useCase"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Use case</FormLabel>
                      <FormDescription>
                        Helps us enable the most relevant workflows.
                      </FormDescription>

                      <Select
                        value={field.value ?? ""}
                        onValueChange={(v) => field.onChange(v || undefined)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select…" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="online-store">
                            Online store
                          </SelectItem>
                          <SelectItem value="catalog">Catalog</SelectItem>
                          <SelectItem value="booking">Booking</SelectItem>
                          <SelectItem value="subscriptions">
                            Subscriptions
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Submit error */}
          {submitError ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
              {submitError}
            </div>
          ) : null}
          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create store & continue"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
