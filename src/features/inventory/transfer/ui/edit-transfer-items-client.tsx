/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
// src/modules/transfer/ui/edit-transfer-items-page.tsx
"use client";

import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import { toast } from "sonner";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { StoreVariantCombobox } from "@/shared/ui/store-variant-combobox";
import { Trash2 } from "lucide-react";
import { useGetTransfer } from "../hooks/use-transfers";
import { useQueryClient } from "@tanstack/react-query";
import type { TransferListItem } from "../types/transfer.type";
import { BackButton } from "@/shared/ui/back-button";

type StockError = {
  productVariantId: string;
  requested: number;
  available: number;
  shortage: number;
  productName?: string | null;
  variantTitle?: string | null;
  sku?: string | null;
  label?: string | null;
};

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
  const [stockErrors, setStockErrors] = useState<StockError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [seeded, setSeeded] = useState(false);

  const { data: transfer, isLoading } = useGetTransfer(
    transferId,
    session,
    axios,
  );

  const cachedTransfer = queryClient
    .getQueryData<TransferListItem[]>(["inventory", "transfers"])
    ?.find((t) => t.id === transferId);

  useEffect(() => {
    if (seeded) return;
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

  const errorVariantIds = new Set(stockErrors.map((e) => e.productVariantId));

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

    setSubmitError(null);
    setStockErrors([]);
    setIsSubmitting(true);

    try {
      await axios.patch(
        `/api/inventory/transfers/${transferId}/items`,
        { items: cleaned },
        {
          headers: {
            Authorization: `Bearer ${session?.backendTokens?.accessToken}`,
          },
        },
      );

      toast.success("Transfer items updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      router.back();
    } catch (err: any) {
      const data = err?.response?.data;
      const errors = data?.errors;
      const msg =
        data?.error?.message ?? data?.message ?? "Something went wrong.";

      if (errors?.length) {
        setStockErrors(errors);
      } else {
        setSubmitError(msg);
        toast.error(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
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
          {lines.map((line, idx) => {
            const stockErr = stockErrors.find(
              (e) => e.productVariantId === line.productVariantId,
            );
            const hasError = !!stockErr;

            return (
              <div key={idx} className="space-y-1">
                <div className="grid grid-cols-12 gap-2 items-center">
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
                      <div
                        className={[
                          "flex flex-col justify-center min-h-9 px-3 py-1.5 border rounded-md",
                          hasError ? "border-red-400 bg-red-50" : "bg-muted/40",
                        ].join(" ")}
                      >
                        <span className="text-xs font-medium truncate">
                          {line.productName ?? "Unknown product"}
                          {line.variantTitle ? (
                            <span
                              className={
                                hasError
                                  ? "text-red-400 font-normal"
                                  : "text-muted-foreground font-normal"
                              }
                            >
                              {" "}
                              — {line.variantTitle}
                            </span>
                          ) : null}
                        </span>
                        {line.sku ? (
                          <span
                            className={[
                              "text-[10px] truncate",
                              hasError
                                ? "text-red-400"
                                : "text-muted-foreground",
                            ].join(" ")}
                          >
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
                        onChange={(e) =>
                          setLine(idx, { quantity: e.target.value })
                        }
                        className={[
                          "text-center px-1",
                          hasError ? "border-red-400 text-red-600" : "",
                        ].join(" ")}
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

                {/* Inline stock error per line */}
                {stockErr && (
                  <p className="text-xs text-red-600 pl-1">
                    Only {stockErr.available} available — short by{" "}
                    {stockErr.shortage}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <Button type="button" variant="clean" onClick={addLine}>
          + Add item
        </Button>

        {/* Generic error */}
        {submitError && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 space-y-1">
            {submitError.split(" | ").map((line, i) => (
              <p key={i} className="text-xs text-red-600">
                {line.trim()}
              </p>
            ))}
          </div>
        )}
        {/* Stock error summary if multiple lines failed */}
        {stockErrors.length > 0 && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 space-y-1">
            <p className="text-sm font-medium text-red-700">
              Insufficient stock for {stockErrors.length} item
              {stockErrors.length !== 1 ? "s" : ""}
            </p>
            {stockErrors.map((e) => (
              <p key={e.productVariantId} className="text-xs text-red-600">
                <span className="font-medium">
                  {e.label ?? e.productName ?? e.productVariantId}
                </span>
                {e.sku ? (
                  <span className="text-red-400"> ({e.sku})</span>
                ) : null}
                : requested {e.requested}, only {e.available} available
              </p>
            ))}
          </div>
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
