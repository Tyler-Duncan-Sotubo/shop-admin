// src/features/analytics/commerce/ui/recent-orders-mobile-row.tsx
"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import type { DataTableMobileRowProps } from "@/shared/ui/data-table";
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

export function RecentOrdersMobileRow({
  row,
  onRowClick,
}: DataTableMobileRowProps<RecentOrderRow>) {
  const o = row.original;
  const items = o.itemsPreview ?? [];
  const href = `/sales/orders/${o.id}`;

  return (
    <div
      className={[
        "px-4 py-4",
        onRowClick ? "cursor-pointer active:bg-muted/40" : "",
      ].join(" ")}
      onClick={() => onRowClick?.(o)}
    >
      {/* Top row: Order + Status */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={href}
            className="text-sm font-semibold text-primary truncate hover:underline"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            Order #{o.orderNumber ?? "—"}
          </Link>

          <div className="mt-1 text-xs text-muted-foreground">{fmtWhen(o)}</div>
        </div>

        <div className="shrink-0">
          <StatusBadge status={o.status} />
        </div>
      </div>

      {/* Items preview */}
      <div className="mt-3 flex items-center gap-3">
        <div className="flex -space-x-2 shrink-0">
          {items.slice(0, 3).map((it: any, idx: number) => (
            <div
              key={`${it?.imageUrl ?? "img"}-${idx}`}
              className="h-9 w-9 overflow-hidden rounded-full border bg-muted"
              title={it?.productName ?? undefined}
            >
              {it?.imageUrl ? (
                <Image
                  src={it.imageUrl}
                  alt={it.productName ?? "Product"}
                  className="h-full w-full object-cover"
                  width={36}
                  height={36}
                />
              ) : null}
            </div>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          {items.length ? (
            <>
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
            </>
          ) : (
            <div className="text-sm text-muted-foreground">—</div>
          )}
        </div>
      </div>

      {/* Bottom row: Total */}
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">Total</span>
        <span className="text-sm font-semibold tabular-nums">
          {formatMoneyNGN(o.totalMinor ?? 0, o.currency ?? "NGN")}
        </span>
      </div>
    </div>
  );
}
