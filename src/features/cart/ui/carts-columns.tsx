"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Badge } from "@/shared/ui/badge";
import type { CartRow } from "../types/cart.type";

export const cartsColumns = (): ColumnDef<CartRow>[] => [
  {
    accessorKey: "id",
    header: "Cart",
    cell: ({ row }) => (
      <Link
        href={`/orders/carts/${row.original.id}`}
        className="font-bold hover:underline text-primary"
      >
        {`#${row.original.cartId}`}
      </Link>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => row.original.total ?? "0",
  },
  {
    accessorKey: "selectedShippingMethodLabel",
    header: "Shipping",
    cell: ({ row }) => row.original.selectedShippingMethodLabel ?? "—",
  },
  {
    accessorKey: "lastActivityAt",
    header: "Last activity",
    cell: ({ row }) =>
      row.original.lastActivityAt
        ? new Date(row.original.lastActivityAt).toLocaleString()
        : "—",
  },
  {
    accessorKey: "expiresAt",
    header: "Expires",
    cell: ({ row }) =>
      row.original.expiresAt
        ? new Date(row.original.expiresAt).toLocaleString()
        : "—",
  },
];
