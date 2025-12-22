/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type { ColumnDef } from "@tanstack/react-table";
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
      ? "warning" // or "secondary" if you don’t have warning
      : "secondary";

  const label =
    status === "in_transit"
      ? "In transit"
      : status.charAt(0).toUpperCase() + status.slice(1);

  return <Badge variant={variant as any}>{label}</Badge>;
}

export const transfersColumns: ColumnDef<TransferListItem>[] = [
  // ✅ Like inventory's "Product" column: rich primary column
  {
    id: "transfer",
    header: "Transfer",
    cell: ({ row }) => {
      const t = row.original;

      return (
        <div className="space-y-0.5">
          <div className="font-medium">
            {t.fromLocationName ?? "Unknown"}{" "}
            <span className="text-muted-foreground">→</span>{" "}
            {t.toLocationName ?? "Unknown"}
          </div>
          <div className="text-xs text-muted-foreground">
            {t.createdAt
              ? new Date(t.createdAt).toLocaleString()
              : "Unknown date"}
          </div>
        </div>
      );
    },
  },

  // ✅ Simple numeric columns like inventory
  {
    accessorKey: "itemsCount",
    header: "Items",
    cell: ({ row }) => <span>{row.original.itemsCount}</span>,
  },
  {
    accessorKey: "totalQuantity",
    header: "Qty",
    cell: ({ row }) => <span>{row.original.totalQuantity ?? 0}</span>,
  },

  // ✅ Status like inventory's status column
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },

  // ✅ Derived column (like adding a derived column in inventory)
  {
    id: "products",
    header: "Products",
    cell: ({ row }) => {
      const t = row.original;

      const labels = (t.items ?? [])
        .map((it) => {
          const base = it.productName ?? it.productVariantId;
          const v = it.variantTitle ? ` - ${it.variantTitle}` : "";
          return `${base}${v}`;
        })
        .slice(0, 2);

      const remaining = (t.items?.length ?? 0) - labels.length;

      return (
        <div className="space-y-0.5">
          {labels.length ? (
            <>
              <div className="text-sm truncate">{labels[0]}</div>
              {labels[1] ? (
                <div className="text-xs text-muted-foreground truncate">
                  {labels[1]}
                </div>
              ) : null}
              {remaining > 0 ? (
                <div className="text-xs text-muted-foreground">
                  +{remaining} more
                </div>
              ) : null}
            </>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </div>
      );
    },
  },
  {
    id: "search",
    accessorFn: (t) => {
      const productsText = (t.items ?? [])
        .map(
          (it) =>
            `${it.productName ?? ""} ${it.variantTitle ?? ""} ${it.sku ?? ""} ${
              it.productVariantId
            } x${it.quantity}`
        )
        .join(" ");

      return [
        t.id,
        t.fromLocationName ?? "",
        t.toLocationName ?? "",
        t.reference ?? "",
        productsText,
      ]
        .join(" ")
        .toLowerCase();
    },
    // hide it from UI
    header: () => null,
    cell: () => null,
    enableSorting: false,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <TransferStatusActions transfer={row.original} />,
  },
];
