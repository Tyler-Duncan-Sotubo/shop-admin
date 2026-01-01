/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Skeleton } from "@/shared/ui/skeleton";
import { formatMoneyNGN } from "@/shared/utils/format-to-naira";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

import { CommerceTopProductRow } from "../../overview/types/commerce-analytics.type";

export function TopProductsCard({
  rows: incomingRows,
  isLoading,
}: {
  rows: CommerceTopProductRow[] | null | undefined;
  isLoading?: boolean;
}) {
  const [by, setBy] = useState<"revenue" | "units">("revenue");

  // normalize + fill defaults (in case API returns partial fields)
  const rows: CommerceTopProductRow[] = useMemo(() => {
    const data = incomingRows ?? [];
    return data.map((r: any) => ({
      productId: r.productId ?? null,
      variantId: r.variantId ?? null,
      productName: r.productName ?? null,
      variantTitle: r.variantTitle ?? null,
      quantity: r.quantity ?? 0,
      revenueMinor: r.revenueMinor ?? 0,
      imageUrl: r.imageUrl ?? null,
      currency: r.currency ?? "NGN",
      categories: r.categories ?? [],
      price: r.price ?? null,
    }));
  }, [incomingRows]);

  // optional: local sorting (only reorders what you already received)
  const sortedRows = useMemo(() => {
    const copy = [...rows];
    if (by === "units") {
      copy.sort((a, b) => (b.quantity ?? 0) - (a.quantity ?? 0));
    } else {
      copy.sort((a, b) => (b.revenueMinor ?? 0) - (a.revenueMinor ?? 0));
    }
    return copy;
  }, [rows, by]);

  return (
    <div className="rounded-xl border p-4">
      {/* Header */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <Link
          href={{
            pathname: "/analytics/pages",
            query: { tab: "top-products" },
          }}
          className="group block rounded-md"
        >
          <div className="mb-3 flex items-center justify-between px-2 py-1 gap-10">
            <div className="text-sm font-semibold text-muted-foreground">
              Top products
            </div>

            <span className="text-xs text-muted-foreground">View all →</span>
          </div>

          {/* Optional hover affordance */}
          <div className="h-px bg-muted/40 group-hover:bg-muted transition-colors" />
        </Link>

        <div className="flex flex-row items-center gap-2">
          <Select value={by} onValueChange={(v) => setBy(v as any)}>
            <SelectTrigger className="h-8 w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="units">Quantity</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Body */}
      {isLoading ? (
        <Skeleton className="h-72 w-full rounded-xl" />
      ) : !sortedRows.length ? (
        <div className="py-10 text-center text-sm text-muted-foreground">
          No top products
        </div>
      ) : (
        <div className="divide-y">
          {sortedRows.map((r) => {
            const name = r.productName || "—";
            const variant = r.variantTitle ? ` — ${r.variantTitle}` : "";
            const cats = r.categories ?? [];
            const firstCats = cats.slice(0, 2);
            const rest = cats.length - firstCats.length;

            return (
              <div
                key={`${r.productId ?? "p"}-${r.variantId ?? "v"}-${name}`}
                className="grid grid-cols-[minmax(0,1fr)_80px_140px] items-center gap-6 py-3 text-sm"
              >
                {/* LEFT: product */}
                <div className="flex min-w-0 items-center gap-3">
                  <div className="h-9 w-9 shrink-0 overflow-hidden rounded-md border bg-muted/30">
                    {r.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.imageUrl}
                        alt={name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : null}
                  </div>

                  <div className="min-w-0 text-sm">
                    {r.productId ? (
                      <Link
                        href={`/products/${r.productId}`}
                        className="font-semibold text-primary hover:underline"
                      >
                        <span className="truncate block">
                          {name}
                          <span className="font-normal text-muted-foreground text-xs">
                            {variant}
                          </span>
                        </span>
                      </Link>
                    ) : (
                      <div className="font-semibold text-primary">
                        <span className="truncate block">
                          {name}
                          <span className="font-normal text-muted-foreground text-xs">
                            {variant}
                          </span>
                        </span>
                      </div>
                    )}

                    <div className="mt-1 flex flex-wrap gap-1 text-xs">
                      {!cats.length ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : (
                        <>
                          {firstCats.map((c) => (
                            <p
                              key={c}
                              className="font-normal text-[10px] rounded-2xl bg-muted/50 px-2 py-0.5 text-muted-foreground"
                            >
                              {c}
                            </p>
                          ))}
                          {rest > 0 ? (
                            <p className="font-thin text-[10px] rounded-2xl bg-primary/10 px-2 py-0.5 text-primary">
                              +{rest}
                            </p>
                          ) : null}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* MIDDLE: quantity */}
                <div className="w-12 flex flex-col items-center justify-center tabular-nums">
                  <div className="text-xs font-semibold">{r.quantity ?? 0}</div>
                  <div className="text-xs text-muted-foreground">Qty</div>
                </div>

                {/* RIGHT: revenue + price */}
                <div className="text-right">
                  <div className="text-xs font-semibold">
                    {formatMoneyNGN(r.revenueMinor ?? 0, r.currency ?? "NGN")}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {r.price
                      ? `Price: ${formatMoneyNGN(r.price, r.currency ?? "NGN")}`
                      : "Price: —"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
