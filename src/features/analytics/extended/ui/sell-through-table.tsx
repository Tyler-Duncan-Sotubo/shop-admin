// src/features/analytics/extended/ui/sell-through-table.tsx
"use client";

import type { SellThroughRow } from "../types/extended-analytics.type";

function SellThroughBar({ rate }: { rate: number }) {
  const pct = Math.min(rate * 100, 100);
  const color =
    pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-rose-500";

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-muted-foreground">
        {pct.toFixed(0)}%
      </span>
    </div>
  );
}

export function SellThroughTable({
  data,
  isLoading,
}: {
  data?: SellThroughRow[];
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
        No inventory data for this period.
      </p>
    );
  }

  return (
    <div className="rounded-xl border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/30">
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
              Product
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
              SKU
            </th>
            <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">
              Sold
            </th>
            <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">
              Available
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
              Sell-through
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {data.map((r, i) => (
            <tr key={`${r.variantId}-${i}`} className="hover:bg-muted/20">
              <td className="px-4 py-2.5">
                <div className="font-medium truncate max-w-[180px]">
                  {r.productName ?? "—"}
                </div>
                {r.variantTitle && (
                  <div className="text-xs text-muted-foreground">
                    {r.variantTitle}
                  </div>
                )}
              </td>
              <td className="px-4 py-2.5 text-xs text-muted-foreground">
                {r.sku ?? "—"}
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums">
                {new Intl.NumberFormat().format(r.unitsSold)}
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums">
                {new Intl.NumberFormat().format(r.unitsAvailable)}
              </td>
              <td className="px-4 py-2.5">
                <SellThroughBar rate={r.sellThroughRate} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
