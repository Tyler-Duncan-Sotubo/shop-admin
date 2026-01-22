// src/features/analytics/commerce/ui/top-products-mobile-row.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import type { DataTableMobileRowProps } from "@/shared/ui/data-table";
import { Badge } from "@/shared/ui/badge";
import { formatMoneyNGN } from "@/shared/utils/format-to-naira";
import type { CommerceTopProductRow } from "../../overview/types/commerce-analytics.type";

function priceText(r: CommerceTopProductRow) {
  if (!r.price) return "—";
  return formatMoneyNGN(r.price, r.currency ?? "NGN");
}

function amountText(r: CommerceTopProductRow) {
  return formatMoneyNGN(r.revenueMinor ?? 0, r.currency ?? "NGN");
}

export function TopProductsMobileRow({
  row,
  onRowClick,
}: DataTableMobileRowProps<CommerceTopProductRow>) {
  const r = row.original;

  const name = r.productName || "—";
  const variant = r.variantTitle ? ` — ${r.variantTitle}` : "";
  const href = r.productId ? `/products/${r.productId}` : undefined;

  const cats = r.categories ?? [];
  const first = cats.slice(0, 2);
  const rest = cats.length - first.length;

  return (
    <div
      className={[
        "px-4 py-4",
        onRowClick ? "cursor-pointer active:bg-muted/40" : "",
      ].join(" ")}
      onClick={() => onRowClick?.(r)}
    >
      {/* Top: product + amount */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {/* thumb */}
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border bg-muted/30">
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

          {/* title */}
          <div className="min-w-0">
            {href ? (
              <Link
                href={href}
                className="block text-sm font-semibold text-primary truncate hover:underline"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                {name}
                <span className="text-muted-foreground font-normal">
                  {variant}
                </span>
              </Link>
            ) : (
              <div className="text-sm font-semibold truncate">
                {name}
                <span className="text-muted-foreground font-normal">
                  {variant}
                </span>
              </div>
            )}

            {/* categories */}
            {cats.length ? (
              <div className="mt-2 flex flex-wrap gap-1">
                {first.map((c) => (
                  <Badge
                    key={c}
                    variant="secondary"
                    className="h-5 px-2 text-[10px] font-normal"
                  >
                    {c}
                  </Badge>
                ))}
                {rest > 0 ? (
                  <Badge
                    variant="outline"
                    className="h-5 px-2 text-[10px] font-normal"
                  >
                    +{rest}
                  </Badge>
                ) : null}
              </div>
            ) : (
              <div className="mt-2 text-xs text-muted-foreground">—</div>
            )}
          </div>
        </div>

        {/* amount */}
        <div className="shrink-0 text-right">
          <div className="text-xs text-muted-foreground">Amount</div>
          <div className="text-sm font-semibold tabular-nums">
            {amountText(r)}
          </div>
        </div>
      </div>

      {/* Bottom: price + qty */}
      <div className="mt-3 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Price</span>
          <span className="font-medium tabular-nums">{priceText(r)}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Qty</span>
          <span className="font-medium tabular-nums">{r.quantity ?? 0}</span>
        </div>
      </div>
    </div>
  );
}
