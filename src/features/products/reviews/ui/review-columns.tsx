"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import type { Review } from "../types/review.type";

export function reviewColumns(opts: {
  onModerate: (review: Review) => void;
}): ColumnDef<Review>[] {
  return [
    {
      accessorKey: "authorName",
      header: "Reviewer",
      cell: ({ row }) => {
        const r = row.original;
        return (
          <div className="space-y-1">
            <div className="font-medium">{r.authorName}</div>
            <div className="text-xs text-muted-foreground">{r.authorEmail}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: ({ row }) => (
        <div className="tabular-nums">{row.original.rating}</div>
      ),
    },
    {
      accessorKey: "review",
      header: "Review",
      cell: ({ row }) => {
        const text = row.original.review ?? "";
        const clipped = text.length > 80 ? `${text.slice(0, 80)}…` : text;
        return <div className="max-w-[520px] text-sm">{clipped}</div>;
      },
    },
    {
      accessorKey: "isApproved",
      header: "Status",
      cell: ({ row }) => {
        const approved = row.original.isApproved;
        return (
          <Badge variant={approved ? "default" : "secondary"}>
            {approved ? "Approved" : "Pending"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        const raw = row.original.createdAt;
        const date = raw ? new Date(raw) : null;
        if (!date) return <div className="text-muted-foreground">—</div>;
        return (
          <div className="tabular-nums">
            {new Intl.DateTimeFormat("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }).format(date)}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-center">Action</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => opts.onModerate(row.original)}
          >
            Moderate
          </Button>
        </div>
      ),
      enableSorting: false,
    },
  ];
}
