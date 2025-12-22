"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CartItemRow } from "../types/cart.type";
import { formatMoneyNGN } from "@/shared/utils/format-to-naira";

export const cartItemsColumns = (): ColumnDef<CartItemRow>[] => [
  {
    accessorKey: "name",
    header: "Item",
    cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
  },
  {
    accessorKey: "sku",
    header: "SKU",
    cell: ({ row }) => row.original.sku ?? "—",
  },
  {
    accessorKey: "quantity",
    header: "Qty",
  },
  {
    accessorKey: "unitPrice",
    header: "Unit",
    cell: ({ row }) => formatMoneyNGN(row.original.unitPrice),
  },
  {
    accessorKey: "lineTotal",
    header: "Total",
    cell: ({ row }) => formatMoneyNGN(row.original.lineTotal),
  },
];
