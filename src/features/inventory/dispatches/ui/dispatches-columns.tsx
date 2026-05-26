// features/inventory/dispatches/ui/dispatches-columns.tsx
"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/shared/ui/badge";
import type { DispatchListItem, DispatchStatus } from "../hooks/use-dispatches";
import { DispatchRowActions } from "./dispatch-row-actions";

function StatusBadge({ status }: { status: DispatchStatus }) {
  if (status === "pending") return <Badge variant="pending">Pending</Badge>;
  if (status === "dispatched")
    return <Badge variant="completed">Dispatched</Badge>;
  return <Badge variant="secondary">Cancelled</Badge>;
}

export const dispatchesColumns: ColumnDef<DispatchListItem>[] = [
  {
    id: "order",
    header: "Order",
    cell: ({ row }) => {
      const d = row.original;
      return (
        <div className="space-y-0.5">
          <div className="font-medium">{d.orderNumber ?? d.orderId}</div>
          {d.customerName ? (
            <div className="text-xs text-muted-foreground">
              {d.customerName}
            </div>
          ) : null}
          {d.shippingAddress?.city ? (
            <div className="text-xs text-muted-foreground">
              {[d.shippingAddress.city, d.shippingAddress.state]
                .filter(Boolean)
                .join(", ")}
            </div>
          ) : null}
        </div>
      );
    },
  },
  {
    id: "items",
    header: "Items",
    cell: ({ row }) => (
      <span className="tabular-nums">{row.original.itemCount ?? "—"}</span>
    ),
  },
  {
    id: "total",
    header: "Total",
    cell: ({ row }) => {
      const d = row.original;
      if (!d.total) return <span className="text-muted-foreground">—</span>;
      return (
        <span className="tabular-nums font-medium">
          {d.currency} {Number(d.total).toLocaleString()}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "requested",
    header: "Requested",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.createdAt
          ? new Date(row.original.createdAt).toLocaleString()
          : "—"}
      </span>
    ),
  },
  {
    id: "dispatched",
    header: "Dispatched At",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.dispatchedAt
          ? new Date(row.original.dispatchedAt).toLocaleString()
          : "—"}
      </span>
    ),
  },
  {
    id: "note",
    header: "Note",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.note ?? "—"}
      </span>
    ),
  },
  {
    id: "search",
    accessorFn: (d) =>
      [
        d.orderId,
        d.orderNumber ?? "",
        d.customerName ?? "",
        d.note ?? "",
        d.shippingAddress?.city ?? "",
        d.shippingAddress?.state ?? "",
      ]
        .join(" ")
        .toLowerCase(),
    header: () => null,
    cell: () => null,
    enableSorting: false,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <DispatchRowActions dispatch={row.original} />,
  },
];
