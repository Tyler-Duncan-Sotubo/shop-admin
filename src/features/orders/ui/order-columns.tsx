"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/shared/ui/badge";
import type { Order } from "../types/order.type";
import { formatMoneyNGN } from "@/shared/utils/format-to-naira";
import Link from "next/link";

function StatusBadge({ status }: { status: Order["status"] }) {
  if (status === "paid") return <Badge>Paid</Badge>;
  if (status === "fulfilled") return <Badge>Fulfilled</Badge>;
  if (status === "cancelled") return <Badge variant="outline">Cancelled</Badge>;
  return <Badge variant="secondary">Pending</Badge>;
}

export const orderColumns: ColumnDef<Order>[] = [
  {
    accessorKey: "orderNumber",
    header: "Order #",
    cell: ({ row }) => {
      const order = row.original;
      return (
        <Link
          href={`/orders/${order.id}`}
          className="text-primary hover:underline font-medium"
        >
          {order.orderNumber}
        </Link>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  { accessorKey: "channel", header: "Channel" },
  {
    accessorKey: "deliveryMethodType",
    header: "Delivery",
    cell: ({ row }) => row.original.deliveryMethodType ?? "—",
  },
  {
    accessorKey: "shippingMethodLabel",
    header: "Method",
    cell: ({ row }) => row.original.shippingMethodLabel ?? "—",
  },
  {
    accessorKey: "total",
    header: () => <div className="text-right">Total</div>,
    cell: ({ row }) => {
      const o = row.original;
      const amt = o.total ?? "0";
      return (
        <div className="text-right">{formatMoneyNGN(amt, o.currency)}</div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) =>
      row.original.createdAt
        ? new Date(row.original.createdAt).toLocaleString()
        : "—",
  },
];
