// src/features/analytics/overview/ui/top-pages-columns.tsx
"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { TopPageRow } from "../../core/types/dashboard-analytics.type";

function fmtInt(n: number) {
  return new Intl.NumberFormat().format(Math.round(n));
}

export const topPagesColumns: ColumnDef<TopPageRow>[] = [
  {
    accessorKey: "title",
    header: "Page",
    cell: ({ row }) => {
      const r = row.original;
      const title = r.title?.trim() ? r.title : r.path;

      return (
        <div className="min-w-0">
          <div className="wrap-break-word font-medium">{title}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "path",
    header: "Path",
    cell: ({ row }) => (
      <div className="min-w-0">
        <div className="truncate text-xs text-muted-foreground">
          {row.original.path}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "pageViews",
    header: () => <div className="text-right">Views</div>,
    cell: ({ row }) => (
      <div className="text-right">{fmtInt(row.original.pageViews ?? 0)}</div>
    ),
  },
  {
    accessorKey: "visits",
    header: () => <div className="text-right">Visits</div>,
    cell: ({ row }) => (
      <div className="text-right">{fmtInt(row.original.visits ?? 0)}</div>
    ),
  },
];
