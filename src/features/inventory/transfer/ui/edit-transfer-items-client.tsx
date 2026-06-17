/* eslint-disable react-hooks/set-state-in-effect */
// src/modules/transfer/ui/edit-transfer-items-page.tsx
"use client";

import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { StoreVariantCombobox } from "@/shared/ui/store-variant-combobox";
import { useUpdateMutation } from "@/shared/hooks/use-update-mutation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useGetTransfer } from "../hooks/use-transfers";
import { useQueryClient } from "@tanstack/react-query";
import type { TransferListItem } from "../types/transfer.type";
import { BackButton } from "@/shared/ui/back-button";

type Line = {
  productVariantId: string;
  quantity: string;
  productName?: string | null;
  variantTitle?: string | null;
  sku?: string | null;
  isNew?: boolean;
};

type Props = {
  transferId: string;
};

export function EditTransferItemsPage({ transferId }: Props) {
  const router = useRouter();
  const axios = useAxiosAuth();
  const { activeStoreId } = useStoreScope();
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const [lines, setLines] = useState<Line[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [seeded, setSeeded] = useState(false);

  const { data: transfer, isLoading } = useGetTransfer(
    transferId,
    session,
    axios,
  );

  // try to get rich item data (with names) from the list cache first
  const cachedTransfer = queryClient
    .getQueryData<TransferListItem[]>(["inventory", "transfers"])
    ?.find((t) => t.id === transferId);

  useEffect(() => {
    if (seeded) return;

    // prefer cached list data since it has productName/variantTitle/sku
    const source = cachedTransfer ?? transfer;
    if (!source?.items?.length) return;

    setLines(
      source.items.map((it) => ({
        productVariantId: it.productVariantId,
        quantity: String(it.quantity),
        productName: it.productName ?? null,
        variantTitle: it.variantTitle ?? null,
        sku: it.sku ?? null,
        isNew: false,
      })),
    );
    setSeeded(true);
  }, [transfer, cachedTransfer, seeded]);

  const updateTransferItems = useUpdateMutation({
    endpoint: `/api/inventory/transfers/${transferId}/items`,
    successMessage: "Transfer items updated successfully.",
    refetchKey: "inventory transfers list history",
    onSuccess: () => {
      setIsSubmitting(false);
      router.back();
    },
    onError: () => {
      setIsSubmitting(false);
    },
  });

  const setLine = (idx: number, patch: Partial<Line>) =>
    setLines((prev) =>
      prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)),
    );

  const addLine = () =>
    setLines((prev) => [
      ...prev,
      { productVariantId: "", quantity: "1", isNew: true },
    ]);

  const removeLine = (idx: number) =>
    setLines((prev) => prev.filter((_, i) => i !== idx));

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const cleaned = lines
      .filter((l) => l.productVariantId && Number(l.quantity) > 0)
      .map((l) => ({
        productVariantId: l.productVariantId,
        quantity: Number(l.quantity),
      }));

    if (!cleaned.length) {
      setSubmitError("At least one item is required.");
      return;
    }

    setIsSubmitting(true);
    await updateTransferItems({ items: cleaned }, setSubmitError);
  };

  if (isLoading && !cachedTransfer) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Loading transfer…
      </div>
    );
  }

  const meta = cachedTransfer ?? transfer;

  if (!meta) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Transfer not found.
      </div>
    );
  }

  const filledCount = lines.filter((l) => l.productVariantId).length;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <BackButton href="/inventory" label="Back to Inventory" />

      <div>
        <h1 className="text-xl font-semibold">Edit transfer items</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {meta.fromLocationName ?? meta.fromLocationId} →{" "}
          {meta.toLocationName ?? meta.toLocationId}
        </p>
        {meta.reference && (
          <p className="text-xs text-muted-foreground mt-0.5">
            Ref: {meta.reference}
          </p>
        )}
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Column headers */}
        <div className="grid grid-cols-12 gap-2 px-1">
          <div className="md:col-span-9 col-span-6 text-xs text-muted-foreground">
            Variant
          </div>
          <div className="md:col-span-3 col-span-6 text-xs text-muted-foreground ml-3">
            Qty
          </div>
        </div>

        {/* Lines */}
        <div className="space-y-3">
          {lines.map((line, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-center">
              {/* Variant cell */}
              <div className="md:col-span-9 col-span-7">
                {line.isNew ? (
                  <StoreVariantCombobox
                    storeId={activeStoreId}
                    value={line.productVariantId}
                    onChange={(variantId) =>
                      setLine(idx, { productVariantId: variantId })
                    }
                    requireStock={false}
                  />
                ) : (
                  <div className="flex flex-col justify-center min-h-9 px-3 py-1.5 border rounded-md bg-muted/40">
                    <span className="text-xs font-medium truncate">
                      {line.productName ?? "Unknown product"}
                      {line.variantTitle ? (
                        <span className="text-muted-foreground font-normal">
                          {" "}
                          — {line.variantTitle}
                        </span>
                      ) : null}
                    </span>
                    {line.sku ? (
                      <span className="text-[10px] text-muted-foreground truncate">
                        SKU: {line.sku}
                      </span>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Qty cell */}
              <div className="md:col-span-3 col-span-4">
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 w-9 p-0 shrink-0"
                    onClick={() => {
                      const current = Number(line.quantity);
                      if (current > 1)
                        setLine(idx, { quantity: String(current - 1) });
                    }}
                  >
                    −
                  </Button>
                  <Input
                    type="number"
                    min={1}
                    value={line.quantity}
                    onChange={(e) => setLine(idx, { quantity: e.target.value })}
                    className="text-center px-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 w-9 p-0 shrink-0"
                    onClick={() =>
                      setLine(idx, {
                        quantity: String(Number(line.quantity) + 1),
                      })
                    }
                  >
                    +
                  </Button>
                  {lines.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLine(idx)}
                      className="p-1 text-muted-foreground hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button type="button" variant="clean" onClick={addLine}>
          + Add item
        </Button>

        {submitError && (
          <div className="text-sm text-red-600">{submitError}</div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <span className="text-sm text-muted-foreground">
            {filledCount} item{filledCount !== 1 ? "s" : ""}
          </span>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
