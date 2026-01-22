"use client";

import * as React from "react";
import type { DataTableMobileRowProps } from "@/shared/ui/data-table";
import type { Quote, QuoteStatus } from "../types/quote.type";
import { Badge } from "@/shared/ui/badge";
import { QuoteDetailsSheet } from "./quote-details-sheet";

function StatusBadge({ status }: { status: QuoteStatus }) {
  if (status === "new") return <Badge>New</Badge>;
  if (status === "in_progress")
    return <Badge variant="secondary">In progress</Badge>;
  if (status === "converted") return <Badge>Converted</Badge>;
  return <Badge variant="outline">Archived</Badge>;
}

export function QuotesMobileRow({
  row,
  onRowClick,
}: DataTableMobileRowProps<Quote>) {
  const q = row.original;

  const created = q.createdAt ? new Date(q.createdAt).toLocaleString() : "—";

  return (
    <div
      className={[
        "p-4",
        onRowClick ? "cursor-pointer active:bg-muted/40" : "",
      ].join(" ")}
      onClick={() => onRowClick?.(q)}
    >
      {/* Top row: email + actions */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-medium truncate">{q.customerEmail}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            {q.customerNote ? "Has note" : "No note"}
          </div>
        </div>

        {/* Use the same action UI as desktop */}
        <div
          className="shrink-0"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <QuoteDetailsSheet quoteId={q.id} />
        </div>
      </div>

      {/* Meta rows */}
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">Status</span>
          <span className="text-sm font-medium">
            <StatusBadge status={q.status} />
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">Created</span>
          <span className="text-sm font-medium text-right">{created}</span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">ID</span>
          <span className="text-sm font-medium truncate max-w-[60%]">
            {q.id}
          </span>
        </div>
      </div>
    </div>
  );
}
