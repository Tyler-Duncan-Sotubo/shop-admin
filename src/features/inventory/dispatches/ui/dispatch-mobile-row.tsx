// features/inventory/dispatches/ui/dispatch-mobile-row.tsx
"use client";

import { useState } from "react";
import type { DataTableMobileRowProps } from "@/shared/ui/data-table";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Package } from "lucide-react";
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

export function DispatchMobileRow({
  row,
}: DataTableMobileRowProps<DispatchListItem>) {
  const d = row.original;
  const [itemsOpen, setItemsOpen] = useState(false);

  return (
    <>
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
            <button
              className="group inline-flex items-center gap-1.5 text-sm tabular-nums"
              onClick={() => setItemsOpen(true)}
            >
              <span className="font-medium">{d.itemCount ?? 0}</span>
              <span className="text-[10px] border rounded px-1 py-0.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                view
              </span>
            </button>
          </div>

          {d.total ? (
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">Total</span>
              <span className="text-sm font-medium tabular-nums">
                {formatMoneyNGN(d.total, d.currency ?? "NGN")}
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

          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2"
            onClick={() => setItemsOpen(true)}
          >
            <Package className="h-3.5 w-3.5 mr-2" />
            View {d.itemCount ?? 0} item{(d.itemCount ?? 0) !== 1 ? "s" : ""}
          </Button>
        </div>
      </div>

      <DispatchItemsModal
        open={itemsOpen}
        onClose={() => setItemsOpen(false)}
        orderId={d.orderId}
        orderNumber={d.orderNumber}
      />
    </>
  );
}
