/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import { Trash2, Minus, Plus, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { formatMoneyNGN } from "@/shared/utils/format-to-naira";

type Item = {
  id: string;
  nameSnapshot: string;
  variantSnapshot?: string | null;
  quantity: number;
  unitPriceMinor?: string | number | null;
  imageUrl?: string | null;
  attributes?: Record<string, unknown> | null;
};

type Props = {
  currency?: string;
  items: Item[];
  isUpdating?: boolean;
  onChangeQuantity?: (itemId: string, quantity: number) => void;
  onRemoveItem?: (itemId: string) => void;
};

export function QuoteItemsCard({
  currency,
  items,
  isUpdating,
  onChangeQuantity,
  onRemoveItem,
}: Props) {
  const [editingItemId, setEditingItemId] = React.useState<string | null>(null);
  const [draftQty, setDraftQty] = React.useState<string>("");

  const getLineTotal = (it: Item) => {
    const price = Number(it.unitPriceMinor ?? 0);
    return price * Number(it.quantity ?? 0);
  };

  const commitQty = (itemId: string, fallbackQty: number) => {
    const parsed = Number(draftQty);

    if (!parsed || parsed <= 0) {
      setEditingItemId(null);
      return;
    }

    if (parsed !== fallbackQty) {
      onChangeQuantity?.(itemId, parsed);
    }

    setEditingItemId(null);
  };

  return (
    <section className="rounded-lg border bg-white">
      <div className="divide-y">
        {items.map((it) => {
          const lineTotal = getLineTotal(it);
          const qty = Number(it.quantity ?? 0);
          const isEditing = editingItemId === it.id;

          return (
            <div key={it.id} className="flex gap-3 px-4 py-4 sm:py-3">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md border bg-muted sm:h-16 sm:w-16">
                {it.imageUrl ? (
                  <img
                    src={it.imageUrl}
                    alt={it.nameSnapshot}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full" />
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="text-sm font-medium wrap-break-word">
                  {it.nameSnapshot}
                </div>

                {it.variantSnapshot && (
                  <div className="text-xs text-muted-foreground">
                    {it.variantSnapshot}
                  </div>
                )}

                <div className="mt-2 flex items-center justify-between">
                  {/* LEFT */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      disabled={isUpdating || qty <= 1}
                      onClick={() => onChangeQuantity?.(it.id, qty - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>

                    {isEditing ? (
                      <Input
                        autoFocus
                        value={draftQty}
                        onChange={(e) => setDraftQty(e.target.value)}
                        onBlur={() => commitQty(it.id, qty)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            commitQty(it.id, qty);
                          }
                        }}
                        className="h-8 w-16 text-center"
                        inputMode="numeric"
                      />
                    ) : (
                      <button
                        className="min-w-12 text-sm font-medium text-center hover:underline"
                        onClick={() => {
                          setEditingItemId(it.id);
                          setDraftQty(String(qty));
                        }}
                      >
                        {qty}
                      </button>
                    )}

                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      disabled={isUpdating}
                      onClick={() => onChangeQuantity?.(it.id, qty + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>

                    {isUpdating && (
                      <Loader2 className="h-4 w-4 animate-spin ml-1 text-muted-foreground" />
                    )}
                  </div>

                  {/* RIGHT */}
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-semibold sm:hidden">
                      {formatMoneyNGN(lineTotal, currency)}
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => onRemoveItem?.(it.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="hidden sm:flex text-sm font-bold whitespace-nowrap">
                {formatMoneyNGN(lineTotal, currency)}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
