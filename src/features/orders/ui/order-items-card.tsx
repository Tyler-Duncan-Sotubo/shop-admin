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
    <section className="rounded-lg border bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="text-sm sm:text-base font-semibold">
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
            <div key={it.id} className="flex gap-3 px-4 py-4 sm:py-3">
              {/* Image */}
              <div className="h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-md border bg-muted">
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

              {/* Details + Price */}
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                {/* Name */}
                <div className="text-sm font-medium leading-tight wrap-break-word">
                  {it.name}
                </div>

                {/* Meta */}
                <div className="text-xs text-muted-foreground">
                  <span className="block sm:inline">SKU: {it.sku ?? "—"}</span>
                  <span className="hidden sm:inline"> · </span>
                  <span className="block sm:inline">Qty: {it.quantity}</span>
                </div>

                {/* Price (mobile) */}
                <div className="mt-1 text-sm font-semibold sm:hidden">
                  {formatMoneyNGN(it.lineTotal, currency)}
                </div>
              </div>

              {/* Price (desktop) */}
              <div className="hidden sm:flex text-sm font-bold whitespace-nowrap items-start">
                {formatMoneyNGN(it.lineTotal, currency)}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
