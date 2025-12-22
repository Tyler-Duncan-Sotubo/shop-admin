/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import { ColumnDef } from "@tanstack/react-table";
import { SortableHeader } from "@/shared/ui/sortable-header";
import { Badge } from "@/shared/ui/badge";
import type { ProductListRow } from "../types/product.type";
import { RowActions } from "@/shared/ui/row-actions";
import Link from "next/link";

export const productColumns: ColumnDef<ProductListRow>[] = [
  {
    accessorKey: "imageUrl",
    header: () => <div className="w-10" />,
    cell: ({ row }) => {
      const url = row.original.imageUrl;
      return (
        <div className="relative h-10 w-10 overflow-hidden rounded-md border bg-muted">
          {url ? (
            <Image
              src={url}
              alt={row.original.name}
              fill
              className="object-cover"
            />
          ) : null}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => <SortableHeader column={column} title="Product" />,
    cell: ({ row }) => {
      const { name, status } = row.original;

      return (
        <div className="font-medium">
          <Link
            href={`/products/${row.original.id}`}
            className="text-primary font-bold"
          >
            {name}{" "}
            <span className="font-bold">
              {status === "draft" && " - Draft"}
            </span>
          </Link>
        </div>
      );
    },
  },

  {
    accessorKey: "stock",
    header: ({ column }) => <SortableHeader column={column} title="Stock" />,
    cell: ({ row }) => (
      <div className="tabular-nums">{row.original.stock ?? 0}</div>
    ),
  },
  {
    accessorKey: "priceLabel",
    header: ({ column }) => <SortableHeader column={column} title="Price" />,
    cell: ({ row }) => {
      const label = row.original.priceLabel;
      if (!label) return <div className="text-muted-foreground">—</div>;

      // if label is "9000 - 10000" or "10000", you can format nicely here:
      const parts = label.split("-").map((s) => s.trim());
      const fmt = new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
      });

      const formatted =
        parts.length === 2
          ? `${fmt.format(Number(parts[0]))} - ${fmt.format(Number(parts[1]))}`
          : fmt.format(Number(parts[0]));

      return <div className="tabular-nums">{formatted}</div>;
    },
  },
  {
    accessorKey: "categories",
    header: () => <div>Categories</div>,
    cell: ({ row }) => {
      const cats = row.original.categories ?? [];
      if (!cats.length) return <div className="text-muted-foreground">—</div>;

      return (
        <div className="flex flex-wrap gap-1">
          {cats.slice(0, 3).map((c) => (
            <Badge key={c.id}>{c.name}</Badge>
          ))}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <SortableHeader column={column} title="Created" />,
    cell: ({ row }) => {
      const raw = row.original.createdAt as any;
      const date = raw ? new Date(raw) : null;
      if (!date) return <div className="text-muted-foreground">—</div>;

      return (
        <div>
          {new Intl.DateTimeFormat("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }).format(date)}
        </div>
      );
    },
  },
  {
    accessorKey: "actions",
    header: () => <div className=" text-center">Action</div>,
    cell: ({ row }) => {
      const id = row.original.id;

      return (
        <RowActions
          row={row.original}
          editHref={`/products/${id}`}
          deleteEndpoint={`/api/catalog/products/${row.original.id}`}
          refetchKey="products"
        />
      );
    },
    enableSorting: false,
  },
];
