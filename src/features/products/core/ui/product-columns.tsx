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
            href={`/products/${row.original.id}?tab=products`}
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
    accessorKey: "price_html",
    header: ({ column }) => <SortableHeader column={column} title="Price" />,
    cell: ({ row }) => {
      const priceHtml = row.original.price_html;

      if (!priceHtml) {
        return <div className="text-muted-foreground">—</div>;
      }

      // case 1: contains <del>/<ins> (on sale)
      if (priceHtml.includes("<")) {
        const formatted = formatPriceHtml(priceHtml);

        return (
          <div
            className="tabular-nums [&_del]:text-muted-foreground [&_del]:mr-2 [&_del]:line-through [&_ins]:font-semibold [&_ins]:text-green-600"
            dangerouslySetInnerHTML={{ __html: formatted }}
          />
        );
      }

      // case 2: normal range or single price ("42000 - 65000")
      const parts = priceHtml.split("-").map((p) => p.trim());
      const formatted =
        parts.length === 2
          ? `${ngn.format(+parts[0])} - ${ngn.format(+parts[1])}`
          : ngn.format(+parts[0]);

      return <div className="tabular-nums">{formatted}</div>;
    },
  },
  {
    accessorKey: "status",
    header: () => <div>Status</div>,
    cell: ({ row }) => {
      return (
        <div className="flex flex-wrap gap-1">
          <Badge>{row.original.status}</Badge>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "stock",
    header: ({ column }) => <SortableHeader column={column} title="In Stock" />,
    cell: ({ row }) => (
      <div className="tabular-nums text-center">{row.original.stock ?? 0}</div>
    ),
  },

  {
    accessorKey: "variantCount",
    header: ({ column }) => <SortableHeader column={column} title="Variants" />,
    cell: ({ row }) => (
      <div className="tabular-nums text-center">
        {row.original.variantCount}
      </div>
    ),
  },

  {
    accessorKey: "actions",
    header: () => <div className=" text-center">Action</div>,
    cell: ({ row }) => {
      const id = row.original.id;

      return (
        <RowActions
          row={row.original}
          editHref={`/products/${id}?tab=products`}
          deleteEndpoint={`/api/catalog/products/${row.original.id}`}
          refetchKey="products"
        />
      );
    },
    enableSorting: false,
  },
];

const ngn = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatPriceHtml(priceHtml: string) {
  return priceHtml.replace(/\d+/g, (match) => ngn.format(Number(match)));
}
