"use client";

import * as React from "react";
import Image from "next/image";
import type { DataTableMobileRowProps } from "@/shared/ui/data-table";
import type { ProductListRow } from "../types/product.type";
import { Badge } from "@/shared/ui/badge";
import { RowActions } from "@/shared/ui/row-actions";
import { useRouter } from "next/navigation";

const ngn = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatPriceHtml(priceHtml: string) {
  return priceHtml.replace(/\d+/g, (match) => ngn.format(Number(match)));
}

function renderPrice(priceHtml?: string | null) {
  if (!priceHtml) return <span className="text-muted-foreground">—</span>;

  if (priceHtml.includes("<")) {
    const formatted = formatPriceHtml(priceHtml);
    return (
      <span
        className="tabular-nums [&_del]:text-muted-foreground [&_del]:mr-2 [&_del]:line-through [&_ins]:font-semibold [&_ins]:text-green-600"
        dangerouslySetInnerHTML={{ __html: formatted }}
      />
    );
  }

  const parts = priceHtml.split("-").map((p) => p.trim());
  const formatted =
    parts.length === 2
      ? `${ngn.format(+parts[0])} - ${ngn.format(+parts[1])}`
      : ngn.format(+parts[0]);

  return <span className="tabular-nums">{formatted}</span>;
}

export function ProductsMobileRow({
  row,
  onRowClick,
}: DataTableMobileRowProps<ProductListRow>) {
  const router = useRouter();
  const p = row.original;

  const editHref = `/products/${p.id}?tab=products`;
  const deleteEndpoint = `/api/catalog/products/${p.id}`;

  return (
    <div
      className="px-4 py-5 cursor-pointer active:bg-muted/40"
      onClick={() => {
        onRowClick?.(p);
        router.push(editHref);
      }}
    >
      <div className="flex items-start gap-3">
        {/* Image */}
        <div className="relative h-18 w-18 shrink-0 overflow-hidden rounded-md border bg-muted">
          {p.imageUrl ? (
            <Image
              src={p.imageUrl}
              alt={p.name}
              fill
              className="object-cover"
            />
          ) : null}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-primary truncate">
            {p.name}
            {p.status === "draft" && (
              <span className="ml-2 font-semibold">- Draft</span>
            )}
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Badge>{p.status}</Badge>

            <span className="text-xs text-muted-foreground">
              Stock:{" "}
              <span className="font-medium text-foreground">
                {p.stock ?? 0}
              </span>
            </span>

            <span className="text-xs text-muted-foreground">
              Variants:{" "}
              <span className="font-medium text-foreground">
                {p.variantCount ?? 0}
              </span>
            </span>
          </div>

          <div className="mt-2 text-xs">{renderPrice(p.price_html)}</div>
        </div>

        {/* Actions — prevent row navigation */}
        <div
          className="shrink-0"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <RowActions
            row={p}
            editHref={editHref}
            deleteEndpoint={deleteEndpoint}
            refetchKey="products"
          />
        </div>
      </div>
    </div>
  );
}
