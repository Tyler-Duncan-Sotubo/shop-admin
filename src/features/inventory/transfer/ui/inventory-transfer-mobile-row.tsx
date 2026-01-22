/* eslint-disable @typescript-eslint/no-explicit-any */
// features/inventory/transfer/ui/inventory-transfer-mobile-row.tsx
"use client";

import * as React from "react";
import type { DataTableMobileRowProps } from "@/shared/ui/data-table";
import { Badge } from "@/shared/ui/badge";
import type { TransferListItem } from "../types/transfer.type";
import { TransferStatusActions } from "./transfer-row-actions";

function StatusBadge({ status }: { status: TransferListItem["status"] }) {
  const variant =
    status === "completed"
      ? "completed"
      : status === "cancelled"
        ? "destructive"
        : status === "in_transit"
          ? "warning"
          : "secondary";

  const label =
    status === "in_transit"
      ? "In transit"
      : status.charAt(0).toUpperCase() + status.slice(1);

  return <Badge variant={variant as any}>{label}</Badge>;
}

function formatProducts(t: TransferListItem) {
  const labels = (t.items ?? [])
    .map((it) => {
      const base = it.productName ?? it.productVariantId;
      const v = it.variantTitle ? ` - ${it.variantTitle}` : "";
      return `${base}${v}`;
    })
    .filter(Boolean);

  if (!labels.length) return "—";

  const firstTwo = labels.slice(0, 2);
  const remaining = labels.length - firstTwo.length;

  return remaining > 0
    ? `${firstTwo.join(", ")} +${remaining} more`
    : firstTwo.join(", ");
}

export function InventoryTransferMobileRow({
  row,
  onRowClick,
}: DataTableMobileRowProps<TransferListItem>) {
  const t = row.original;

  const title = `${t.fromLocationName ?? "Unknown"} → ${t.toLocationName ?? "Unknown"}`;
  const created = t.createdAt
    ? new Date(t.createdAt).toLocaleString()
    : "Unknown date";
  const products = formatProducts(t);

  return (
    <div
      className={[
        "p-4",
        onRowClick ? "cursor-pointer active:bg-muted/40" : "",
      ].join(" ")}
      onClick={() => onRowClick?.(t)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-medium truncate">{title}</div>
          <div className="mt-1 text-xs text-muted-foreground">{created}</div>
        </div>

        <div
          className="shrink-0"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <TransferStatusActions transfer={t} />
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">Status</span>
          <span className="text-sm font-medium">
            <StatusBadge status={t.status} />
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">Items</span>
          <span className="text-sm font-medium tabular-nums">
            {t.itemsCount}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">Qty</span>
          <span className="text-sm font-medium tabular-nums">
            {t.totalQuantity ?? 0}
          </span>
        </div>

        <div className="flex items-start justify-between gap-3">
          <span className="text-xs text-muted-foreground">Products</span>
          <span className="text-sm font-medium text-right line-clamp-2 max-w-[70%]">
            {products}
          </span>
        </div>
      </div>
    </div>
  );
}
