/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { Button } from "@/shared/ui/button";
import { P } from "@/shared/ui/typography";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

import { useStores } from "../hooks/use-stores";
import type { Store } from "../types/store.type";
import { useStoreDomains } from "../hooks/use-store-domains";
import { StoreDomainsModal } from "./store-domains-modal";
import { FaPlus } from "react-icons/fa6";

function normalizeDomain(input: string) {
  let s = (input || "").trim().toLowerCase();
  s = s.replace(/^https?:\/\//, "");
  s = s.split("/")[0].split("?")[0].split("#")[0];
  s = s.split(":")[0];
  if (s.endsWith(".")) s = s.slice(0, -1);
  if (s.startsWith("www.")) s = s.slice(4);
  return s;
}

export default function StoreDomainsClient({ storeId }: { storeId: string }) {
  const { stores } = useStores();
  const store = useMemo<Store | null>(
    () => stores.find((s) => s.id === storeId) ?? null,
    [stores, storeId]
  );

  const { domains, isLoading, fetchError } = useStoreDomains(storeId);

  const [open, setOpen] = useState(false);

  const activeDomains = useMemo(
    () => (domains ?? []).filter((d: any) => !d?.deletedAt),
    [domains]
  );

  const primaryDomain = useMemo(() => {
    const primary = activeDomains.find((d: any) => d.isPrimary)?.domain;
    if (primary) return normalizeDomain(primary);
    const first = activeDomains[0]?.domain;
    return first ? normalizeDomain(first) : "";
  }, [activeDomains]);

  const extraDomains = useMemo(() => {
    const extras = activeDomains
      .map((d: any) => normalizeDomain(d.domain))
      .filter((d: string) => d && d !== primaryDomain);
    return extras;
  }, [activeDomains, primaryDomain]);

  const hasDomains = Boolean(primaryDomain) || extraDomains.length > 0;

  return (
    <section className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">Domains</div>
          <p className="text-xs text-muted-foreground ">
            Manage the website address customers use to access this store.
          </p>
        </div>

        <Button onClick={() => setOpen(true)} disabled={!storeId}>
          <FaPlus /> {hasDomains ? "Edit domains" : "Add domain"}
        </Button>
      </div>

      <div>
        <div className="mb-3">
          <div className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            Current domains
          </div>
        </div>

        <div className="space-y-3 text-sm">
          {isLoading ? (
            <P className="text-sm text-muted-foreground">Loading domains…</P>
          ) : fetchError ? (
            <P className="text-sm text-destructive">
              Failed to load domains: {fetchError}
            </P>
          ) : !hasDomains ? (
            <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              No domains configured yet. Add a primary domain to enable your
              online store URL.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-lg border bg-muted/20 p-3">
                <P className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Primary domain
                </P>
                <div className="mt-1 font-mono text-sm">{primaryDomain}</div>
              </div>

              <div className="rounded-lg border bg-muted/20 p-3">
                <P className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Additional domains
                </P>

                {extraDomains.length === 0 ? (
                  <P className="mt-1 text-sm text-muted-foreground">None</P>
                ) : (
                  <ul className="mt-1 space-y-1">
                    {extraDomains.map((d) => (
                      <li
                        key={d}
                        className={cn("font-mono text-sm", "truncate")}
                        title={d}
                      >
                        {d}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <P className="text-xs text-muted-foreground">
                Tip: You can add multiple domains and set one as primary.
              </P>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Keep your existing modal */}
      <StoreDomainsModal
        open={open}
        store={store}
        onClose={() => setOpen(false)}
      />
    </section>
  );
}
