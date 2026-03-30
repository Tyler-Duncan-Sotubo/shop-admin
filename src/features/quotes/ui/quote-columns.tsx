// features/quotes/components/quote-columns.tsx
"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/shared/ui/badge";
import type { Quote, QuoteStatus } from "../types/quote.type";
import Link from "next/link";
import { Button } from "@/shared/ui/button";

function StatusBadge({ status }: { status: QuoteStatus }) {
  if (status === "new") return <Badge>New</Badge>;
  if (status === "in_progress")
    return <Badge variant="secondary">In progress</Badge>;
  if (status === "converted") return <Badge>Converted</Badge>;
  return <Badge variant="outline">Archived</Badge>;
}

export const quoteColumns: ColumnDef<Quote>[] = [
  {
    accessorKey: "customerName",
    header: "Customer",
    cell: ({ row }) => {
      const q = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{q.customerName}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "customerEmail",
    header: "Customer",
    cell: ({ row }) => {
      const q = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{q.customerEmail}</span>
          <span className="text-xs text-muted-foreground">
            {q.customerNote ? "Has note" : "No note"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) =>
      row.original.createdAt
        ? new Date(row.original.createdAt).toLocaleString()
        : "—",
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Link href={`/sales/rfqs/${row.original.id}`}>
        <Button size="sm" variant="outline">
          View
        </Button>
      </Link>
    ),
  },
];
