"use client";

import * as React from "react";
import type { DataTableMobileRowProps } from "@/shared/ui/data-table";
import type { Review } from "../types/review.type";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

function StatusBadge({ approved }: { approved: boolean }) {
  return (
    <Badge variant={approved ? "default" : "secondary"}>
      {approved ? "Approved" : "Pending"}
    </Badge>
  );
}

function formatDate(raw?: string | Date | null) {
  const date = raw ? (raw instanceof Date ? raw : new Date(raw)) : null;
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function ReviewsMobileRow({
  row,
  table,
  onRowClick,
}: DataTableMobileRowProps<Review>) {
  const r = row.original;

  const clipped =
    (r.review ?? "").length > 140
      ? `${(r.review ?? "").slice(0, 140)}…`
      : (r.review ?? "—");

  const meta = (table.options.meta ?? {}) as {
    onModerate?: (review: Review) => void;
  };

  return (
    <div
      className={[
        "p-4",
        onRowClick ? "cursor-pointer active:bg-muted/40" : "",
      ].join(" ")}
      onClick={() => onRowClick?.(r)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-medium truncate">{r.authorName}</div>
          <div className="mt-1 text-xs text-muted-foreground truncate">
            {r.authorEmail}
          </div>
        </div>

        <div className="shrink-0 flex flex-col items-end gap-2">
          <StatusBadge approved={Boolean(r.isApproved)} />
          <div className="text-xs text-muted-foreground tabular-nums">
            {formatDate(r.createdAt)}
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">Rating</span>
          <span className="text-sm font-medium tabular-nums">{r.rating}</span>
        </div>

        <div className="text-sm text-muted-foreground leading-relaxed">
          {clipped}
        </div>

        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              meta.onModerate?.(r);
            }}
          >
            Moderate
          </Button>
        </div>
      </div>
    </div>
  );
}
