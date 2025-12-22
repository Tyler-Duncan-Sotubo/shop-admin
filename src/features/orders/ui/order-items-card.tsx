"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
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
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Items{" "}
          <span className="text-muted-foreground">({items?.length ?? 0})</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {(items ?? []).map((it) => (
          <div key={it.id} className="flex items-start gap-4">
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

            {/* Name + meta */}
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium truncate">{it.name}</div>
              <div className="text-xs text-muted-foreground">
                SKU: {it.sku ?? "—"} · Qty: {it.quantity}
              </div>
            </div>

            {/* Total */}
            <div className="text-sm whitespace-nowrap">
              {formatMoneyNGN(it.lineTotal, currency)}
            </div>
          </div>
        ))}

        {(items ?? []).length === 0 && (
          <div className="text-sm text-muted-foreground">
            No items found for this order.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
