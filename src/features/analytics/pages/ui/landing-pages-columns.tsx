// src/features/analytics/overview/ui/landing-pages-columns.tsx
"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { LandingPageRow } from "../../core/types/dashboard-analytics.type";

function fmtInt(n: number) {
  return new Intl.NumberFormat().format(Math.round(n));
}

export const landingPagesColumns: ColumnDef<LandingPageRow>[] = [
  {
    accessorKey: "title",
    header: "Landing page",
    cell: ({ row }) => {
      const r = row.original;
      const title = r.title?.trim() ? r.title : r.path;

      return (
        <div className="max-w-sm space-y-1">
          <div className="wrap-break-word font-medium">{title}</div>
          <div className="wrap-break-word text-xs text-muted-foreground">
            {r.path}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "visits",
    header: () => <div className="text-right">Visits</div>,
    cell: ({ row }) => (
      <div className="text-right">{fmtInt(row.original.visits ?? 0)}</div>
    ),
  },
];
