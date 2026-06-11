"use client";

import Link from "next/link";
import type { DataTableMobileRowProps } from "@/shared/ui/data-table";
import type { Order, OrderWithItems } from "../types/order.type";
import { formatMoneyNGN } from "@/shared/utils/format-to-naira";
import { Badge } from "@/shared/ui/badge";

function StatusBadge({ status }: { status: OrderWithItems["status"] }) {
  if (status === "paid") return <Badge variant="success">Paid</Badge>;
  if (status === "fulfilled") return <Badge variant="success">Fulfilled</Badge>;
  if (status === "awaiting_dispatch")
    return <Badge variant="info">Awaiting Dispatch</Badge>;
  if (status === "lay_buy") return <Badge variant="warning">Lay-buy</Badge>;
  if (status === "pending_payment")
    return <Badge variant="warning">Pending Payment</Badge>;
  if (status === "draft") return <Badge variant="muted">Draft</Badge>;
  if (status === "refunded") return <Badge variant="danger">Refunded</Badge>;
  if (status === "cancelled") return <Badge variant="danger">Cancelled</Badge>;
  return <Badge variant="muted">On hold</Badge>;
}

export function OrdersMobileRow({
  row,
  onRowClick,
}: DataTableMobileRowProps<Order>) {
  const o = row.original;

  return (
    <div
      className={[
        "p-4",
        onRowClick ? "cursor-pointer active:bg-muted/40" : "",
      ].join(" ")}
      onClick={() => onRowClick?.(o)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/sales/orders/${o.id}`}
            className="font-medium text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            Order #{o.orderNumber}
          </Link>

          <div className="mt-1 text-xs text-muted-foreground">
            {o.createdAt ? new Date(o.createdAt).toLocaleString() : "—"}
          </div>
        </div>

        <div className="shrink-0">
          <StatusBadge status={o.status} />
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">Total</span>
          <span className="text-sm font-medium">
            {formatMoneyNGN(o.total ?? "0", o.currency)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">Channel</span>
          <span className="text-sm font-medium">{o.channel ?? "—"}</span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">Delivery</span>
          <span className="text-sm font-medium">
            {o.deliveryMethodType ?? "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
