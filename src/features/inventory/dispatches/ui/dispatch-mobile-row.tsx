// features/inventory/dispatches/ui/dispatch-mobile-row.tsx
"use client";

import type { DataTableMobileRowProps } from "@/shared/ui/data-table";
import { Badge } from "@/shared/ui/badge";
import type { DispatchListItem, DispatchStatus } from "../hooks/use-dispatches";
import { DispatchRowActions } from "./dispatch-row-actions";

function StatusBadge({ status }: { status: DispatchStatus }) {
  if (status === "pending") return <Badge variant="pending">Pending</Badge>;
  if (status === "dispatched")
    return <Badge variant="completed">Dispatched</Badge>;
  return <Badge variant="secondary">Cancelled</Badge>;
}

export function DispatchMobileRow({
  row,
}: DataTableMobileRowProps<DispatchListItem>) {
  const d = row.original;

  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
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
          <div className="mt-1 text-xs text-muted-foreground">
            {d.createdAt ? new Date(d.createdAt).toLocaleString() : "—"}
          </div>
        </div>

        <div
          className="shrink-0"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <DispatchRowActions dispatch={d} />
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">Status</span>
          <StatusBadge status={d.status} />
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">Items</span>
          <span className="text-sm tabular-nums">{d.itemCount ?? "—"}</span>
        </div>

        {d.total ? (
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">Total</span>
            <span className="text-sm font-medium tabular-nums">
              {d.currency} {Number(d.total).toLocaleString()}
            </span>
          </div>
        ) : null}

        {d.note ? (
          <div className="flex items-start justify-between gap-3">
            <span className="text-xs text-muted-foreground">Note</span>
            <span className="text-sm text-right max-w-[70%]">{d.note}</span>
          </div>
        ) : null}

        {d.dispatchedAt ? (
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">Dispatched</span>
            <span className="text-sm">
              {new Date(d.dispatchedAt).toLocaleString()}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
