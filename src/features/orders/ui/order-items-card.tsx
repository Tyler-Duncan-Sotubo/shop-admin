"use client";

import { formatMoneyNGN } from "@/shared/utils/format-to-naira";

type Item = {
  id: string;
  name: string;
  sku?: string | null;
  quantity: number;
  lineTotal?: string | null;
  imageUrl?: string | null;
};

export function OrderItemsCard({
  currency,
  items,
}: {
  currency?: string;
  items: Item[];
}) {
  const count = items?.length ?? 0;

  return (
    <section className="rounded-lg border">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="text-base font-semibold">
          Items <span className="text-muted-foreground">({count})</span>
        </h3>
      </div>

      {/* Content */}
      <div className="divide-y">
        {count === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">
            No items found for this order.
          </div>
        ) : (
          items.map((it) => (
            <div key={it.id} className="flex items-start gap-3 px-4 py-3">
              {/* Image */}
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md border bg-muted">
                {it.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={it.imageUrl}
                    alt={it.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full" />
                )}
              </div>

              {/* Details */}
              <div className="min-w-0 flex-1 font-medium ">
                <div className="text-sm font-medium truncate">{it.name}</div>

                <div className="mt-1 text-xs font-medium  text-muted-foreground">
                  SKU: {it.sku ?? "—"} · Qty: {it.quantity}
                </div>
              </div>

              {/* Price */}
              <div className="text-sm font-bold whitespace-nowrap">
                {formatMoneyNGN(it.lineTotal, currency)}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
