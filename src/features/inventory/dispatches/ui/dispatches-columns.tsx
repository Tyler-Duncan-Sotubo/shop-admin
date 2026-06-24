// features/inventory/dispatches/ui/dispatches-columns.tsx
"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/shared/ui/badge";
import type { DispatchListItem, DispatchStatus } from "../hooks/use-dispatches";
import { DispatchRowActions } from "./dispatch-row-actions";
import { DispatchItemsModal } from "./dispatch-items-modal";
import { formatMoneyNGN } from "@/shared/utils/format-to-naira";

function StatusBadge({ status }: { status: DispatchStatus }) {
  if (status === "pending") return <Badge variant="pending">Pending</Badge>;
  if (status === "dispatched")
    return <Badge variant="completed">Dispatched</Badge>;
  return <Badge variant="secondary">Cancelled</Badge>;
}

function ItemsCell({ dispatch }: { dispatch: DispatchListItem }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="inline-flex items-center gap-1.5 text-sm tabular-nums hover:text-primary transition-colors"
        onClick={() => setOpen(true)}
      >
        <span className="font-medium">{dispatch.itemCount ?? 0}</span>
        <span className="text-[10px] border rounded px-1.5 py-0.5 text-muted-foreground hover:border-primary hover:text-primary transition-colors">
          view
        </span>
      </button>

      <DispatchItemsModal
        open={open}
        onClose={() => setOpen(false)}
        orderId={dispatch.orderId}
        orderNumber={dispatch.orderNumber}
      />
    </>
  );
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
    cell: ({ row }) => <ItemsCell dispatch={row.original} />,
  },
  {
    id: "total",
    header: "Total",
    cell: ({ row }) => {
      const d = row.original;
      if (!d.total) return <span className="text-muted-foreground">—</span>;
      return (
        <span className="tabular-nums font-medium">
          {formatMoneyNGN(d.total, d.currency ?? "NGN")}
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
    id: "origin",
    header: "Origin",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.originLocationName ?? "—"}
      </span>
    ),
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
