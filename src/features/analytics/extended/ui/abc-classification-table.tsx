// src/features/analytics/extended/ui/abc-classification-table.tsx
"use client";

import { Badge } from "@/shared/ui/badge";
import { formatMoneyNGN } from "@/shared/utils/format-to-naira";
import type { ProductAbcRow, AbcTier } from "../types/extended-analytics.type";

function TierBadge({ tier }: { tier: AbcTier }) {
  if (tier === "A")
    return (
      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
        A
      </Badge>
    );
  if (tier === "B")
    return (
      <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
        B
      </Badge>
    );
  return (
    <Badge className="bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-100">
      C
    </Badge>
  );
}

function RevenueBar({ share }: { share: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-foreground/70"
          style={{ width: `${Math.min(share * 100, 100)}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground tabular-nums">
        {(share * 100).toFixed(1)}%
      </span>
    </div>
  );
}

export function AbcClassificationTable({
  data,
  isLoading,
}: {
  data?: ProductAbcRow[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 rounded-lg bg-muted/30 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data?.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No product data for this period.
      </p>
    );
  }

  return (
    <div className="rounded-xl border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/30">
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
              Tier
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
              Product
            </th>
            <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">
              Units
            </th>
            <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">
              Revenue
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
              Share
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {data.map((r, i) => (
            <tr
              key={`${r.productId}-${r.variantId}-${i}`}
              className="hover:bg-muted/20"
            >
              <td className="px-4 py-2.5">
                <TierBadge tier={r.tier} />
              </td>
              <td className="px-4 py-2.5">
                <div className="font-medium truncate max-w-[200px]">
                  {r.productName ?? "—"}
                </div>
                {r.variantTitle && (
                  <div className="text-xs text-muted-foreground">
                    {r.variantTitle}
                  </div>
                )}
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums">
                {new Intl.NumberFormat().format(r.quantity)}
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums font-medium">
                {formatMoneyNGN(r.revenueMinor, "NGN")}
              </td>
              <td className="px-4 py-2.5">
                <RevenueBar share={r.revenueShare} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
