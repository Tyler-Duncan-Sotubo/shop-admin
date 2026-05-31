"use client";

import * as React from "react";
import { Trash2, Minus, Plus, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { formatMoneyNGN } from "@/shared/utils/format-to-naira";
import { useRemoveOrderItem, useUpdateOrderItemQty } from "../hooks/use-orders";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { toast } from "sonner";

type Item = {
  id: string;
  name: string;
  sku?: string | null;
  quantity: number;
  lineTotal?: string | null;
  imageUrl?: string | null;
};

type Props = {
  orderId: string;
  currency?: string;
  items: Item[];
};

export function OrderItemsCard({ orderId, currency, items }: Props) {
  const { data: session } = useSession();
  const axios = useAxiosAuth();
  const updateQty = useUpdateOrderItemQty(session, axios);
  const removeItem = useRemoveOrderItem(session, axios);

  const [editingItemId, setEditingItemId] = React.useState<string | null>(null);
  const [draftQty, setDraftQty] = React.useState<string>("");
  const [pendingItemId, setPendingItemId] = React.useState<string | null>(null);

  const count = items?.length ?? 0;

  const handleQtyChange = async (itemId: string, newQty: number) => {
    if (newQty <= 0) return;
    setPendingItemId(itemId);
    try {
      await updateQty.mutateAsync({ orderId, itemId, quantity: newQty });
    } catch (e) {
      toast.error((e as Error).message ?? "Failed to update quantity");
    } finally {
      setPendingItemId(null);
    }
  };

  const commitQty = async (itemId: string, fallbackQty: number) => {
    const parsed = Number(draftQty);
    setEditingItemId(null);
    if (!parsed || parsed <= 0 || parsed === fallbackQty) return;
    await handleQtyChange(itemId, parsed);
  };

  const handleRemove = async (itemId: string) => {
    setPendingItemId(itemId);
    try {
      await removeItem.mutateAsync({ orderId, itemId });
      toast.success("Item removed");
    } catch (e) {
      toast.error((e as Error).message ?? "Failed to remove item");
    } finally {
      setPendingItemId(null);
    }
  };

  return (
    <section className="rounded-lg border bg-white">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="text-sm sm:text-base font-semibold">
          Items <span className="text-muted-foreground">({count})</span>
        </h3>
      </div>

      <div className="divide-y">
        {count === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">
            No items found for this order.
          </div>
        ) : (
          items.map((it) => {
            const qty = Number(it.quantity ?? 0);
            const isEditing = editingItemId === it.id;
            const isBusy = pendingItemId === it.id;

            return (
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

                {/* Main content */}
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  {/* Name + price */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm font-medium leading-tight wrap-break-word min-w-0">
                      {it.name}
                    </div>
                    <div className="text-sm font-bold whitespace-nowrap shrink-0">
                      {formatMoneyNGN(it.lineTotal, currency)}
                    </div>
                  </div>

                  {it.sku && (
                    <div className="text-xs text-muted-foreground">
                      SKU: {it.sku}
                    </div>
                  )}

                  {/* Controls */}
                  <div className="mt-2 flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      disabled={isBusy || qty <= 1}
                      onClick={() => handleQtyChange(it.id, qty - 1)}
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
                          if (e.key === "Enter") commitQty(it.id, qty);
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
                      disabled={isBusy}
                      onClick={() => handleQtyChange(it.id, qty + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>

                    {isBusy && (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive ml-auto"
                      disabled={isBusy}
                      onClick={() => handleRemove(it.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
