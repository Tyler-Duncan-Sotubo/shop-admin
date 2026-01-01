// src/features/analytics/commerce/ui/recent-orders-columns.tsx
"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/shared/ui/badge";
import { formatMoneyNGN } from "@/shared/utils/format-to-naira";
import type { RecentOrderRow } from "../../overview/types/commerce-analytics.type";

function StatusBadge({ status }: { status: string }) {
  const s = (status ?? "").toLowerCase();

  if (s === "paid" || s === "completed") return <Badge>Paid</Badge>;
  if (s === "fulfilled")
    return (
      <Badge variant="default" className="bg-yellow-400">
        Shipped
      </Badge>
    );
  if (s === "cancelled" || s === "canceled")
    return <Badge variant="outline">Cancelled</Badge>;
  if (s === "pending_payment" || s === "pending")
    return <Badge variant="secondary">Pending</Badge>;

  return <Badge variant="secondary">{status}</Badge>;
}

function fmtWhen(row: RecentOrderRow) {
  const iso = row.paidAt ?? row.createdAt;
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

export const recentOrdersColumns: ColumnDef<RecentOrderRow>[] = [
  {
    accessorKey: "orderNumber",
    header: "Order #",
    cell: ({ row }) => {
      const o = row.original;
      return (
        <Link
          href={`/sales/orders/${o.id}`}
          className="font-medium text-primary hover:underline"
        >
          {o.orderNumber}
        </Link>
      );
    },
  },

  {
    accessorKey: "itemsPreview",
    header: "Items",
    cell: ({ row }) => {
      const items = row.original.itemsPreview ?? [];
      if (!items.length)
        return <span className="text-muted-foreground">—</span>;

      return (
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {items.slice(0, 3).map((it, idx) => (
              <div
                key={`${it.imageUrl ?? "img"}-${idx}`}
                className="h-7 w-7 overflow-hidden rounded-full border bg-muted"
                title={it.productName ?? undefined}
              >
                {it.imageUrl ? (
                  <Image
                    src={it.imageUrl}
                    alt={it.productName ?? "Product"}
                    className="h-full w-full object-cover"
                    width={28}
                    height={28}
                  />
                ) : null}
              </div>
            ))}
          </div>

          <div className="min-w-0">
            <div className="truncate text-sm font-medium">
              {items[0]?.productName ?? "Item"}
              {items.length > 1 ? (
                <span className="text-muted-foreground">
                  {" "}
                  +{items.length - 1} more
                </span>
              ) : null}
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {items[0]?.category ?? "—"}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "totalMinor",
    header: () => <div className="text-right">Total</div>,
    cell: ({ row }) => {
      const o = row.original;
      return (
        <div className="text-right">
          {formatMoneyNGN(o.totalMinor ?? 0, o.currency ?? "NGN")}
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
    header: "When",
    cell: ({ row }) => fmtWhen(row.original),
  },
];
