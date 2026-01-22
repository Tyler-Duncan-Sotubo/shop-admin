// src/features/analytics/overview/ui/landing-pages-mobile-row.tsx
"use client";

import type { DataTableMobileRowProps } from "@/shared/ui/data-table";
import type { LandingPageRow } from "../../core/types/dashboard-analytics.type";

function fmtInt(n: number) {
  return new Intl.NumberFormat().format(Math.round(n));
}

export function LandingPagesMobileRow({
  row,
  onRowClick,
}: DataTableMobileRowProps<LandingPageRow>) {
  const r = row.original;
  const title = r.title?.trim() ? r.title : r.path;

  return (
    <div
      className={[
        "px-4 py-4",
        onRowClick ? "cursor-pointer active:bg-muted/40" : "",
      ].join(" ")}
      onClick={() => onRowClick?.(r)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold truncate">{title}</div>
          <div className="mt-1 text-xs text-muted-foreground truncate">
            {r.path}
          </div>
        </div>

        <div className="shrink-0 text-right">
          <div className="text-xs text-muted-foreground">Visits</div>
          <div className="text-sm font-semibold tabular-nums">
            {fmtInt(r.visits ?? 0)}
          </div>
        </div>
      </div>
    </div>
  );
}
