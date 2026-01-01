// src/features/analytics/commerce/ui/top-products-columns.tsx
"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Badge } from "@/shared/ui/badge";
import { formatMoneyNGN } from "@/shared/utils/format-to-naira";
import type { CommerceTopProductRow } from "../../overview/types/commerce-analytics.type";

function ProductCell({ row }: { row: CommerceTopProductRow }) {
  const name = row.productName || "—";
  const variant = row.variantTitle ? ` — ${row.variantTitle}` : "";

  return (
    <div className="flex items-center gap-3 text-xs">
      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-md border bg-muted/30">
        {row.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={row.imageUrl}
            alt={name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : null}
      </div>

      <div className="min-w-0">
        {row.productId ? (
          <Link
            href={`/products/${row.productId}`}
            className="text-primary hover:underline font-medium"
          >
            {name}
            <span className="text-muted-foreground font-normal">{variant}</span>
          </Link>
        ) : (
          <div className="font-medium">
            {name}
            <span className="text-muted-foreground font-normal">{variant}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export const topProductsColumns: ColumnDef<CommerceTopProductRow>[] = [
  {
    id: "product",
    header: "Product",
    cell: ({ row }) => <ProductCell row={row.original} />,
  },
  {
    accessorKey: "price",
    header: () => <div className="text-right">Price</div>,
    cell: ({ row }) => {
      const r = row.original;

      if (!r.price)
        return <div className="text-right text-muted-foreground">—</div>;

      return (
        <div className="text-right">
          {formatMoneyNGN(r.price, r.currency ?? "NGN")}
        </div>
      );
    },
  },
  {
    accessorKey: "categories",
    header: "Categories",
    cell: ({ row }) => {
      const cats = row.original.categories ?? [];
      if (!cats.length) return <span className="text-muted-foreground">—</span>;

      const first = cats.slice(0, 2);
      const rest = cats.length - first.length;

      return (
        <div className="flex flex-wrap gap-1">
          {first.map((c) => (
            <Badge key={c} variant="secondary" className="font-normal">
              {c}
            </Badge>
          ))}
          {rest > 0 ? (
            <Badge variant="outline" className="font-normal">
              +{rest}
            </Badge>
          ) : null}
        </div>
      );
    },
  },
  {
    accessorKey: "quantity",
    header: () => <div className="text-right">Quantity</div>,
    cell: ({ row }) => (
      <div className="text-right">{row.original.quantity ?? 0}</div>
    ),
  },
  {
    accessorKey: "revenueMinor",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const r = row.original;

      return (
        <div className="text-right">
          {formatMoneyNGN(row.original.revenueMinor, r.currency ?? "NGN")}
        </div>
      );
    },
  },
];
