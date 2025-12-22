/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { FormEvent, useState } from "react";
import { FormModal } from "@/shared/ui/form-modal";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useCreateMutation } from "@/shared/hooks/use-create-mutation";
import type { InventoryOverviewRow } from "../../inventory/core/types/inventory.type";
import { StoreVariantCombobox } from "@/shared/ui/store-variant-combobox";
import { useStoreScope } from "@/lib/providers/store-scope-provider";

type Props = {
  open: boolean;
  onClose: () => void;

  orderId: string;
  currency?: string; // for display if you want
  rows: InventoryOverviewRow[]; // used to build variant options (like transfers)
};

type Line = {
  variantId: string;
  quantity: number;
  unitPrice: number;
  name?: string;
  sku?: string | null;
  attributes?: any;
};

type AddManualOrderItemPayload = {
  orderId: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  name?: string;
  sku?: string | null;
  attributes?: any;
};

export function AddManualOrderItemsModal({
  open,
  onClose,
  orderId,
  currency,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { activeStoreId } = useStoreScope();

  const [lines, setLines] = useState<Line[]>([
    { variantId: "", quantity: 1, unitPrice: 0 },
  ]);

  const addItem = useCreateMutation<AddManualOrderItemPayload>({
    endpoint: "/api/orders/manual/items",
    successMessage: "Item(s) added",
    refetchKey: "orders", // or whatever you use for order detail query key
    onSuccess: () => {
      setSubmitError(null);
      setIsSubmitting(false);
      setLines([{ variantId: "", quantity: 1, unitPrice: 0 }]);
      onClose();
    },
    onError: () => setIsSubmitting(false),
  });

  const setLine = (idx: number, patch: Partial<Line>) => {
    setLines((prev) =>
      prev.map((l, i) => (i === idx ? { ...l, ...patch } : l))
    );
  };

  const addLine = () =>
    setLines((prev) => [...prev, { variantId: "", quantity: 1, unitPrice: 0 }]);

  const removeLine = (idx: number) =>
    setLines((prev) => prev.filter((_, i) => i !== idx));

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const cleaned = lines
      .filter(
        (l) => l.variantId && Number(l.quantity) > 0 && Number(l.unitPrice) >= 0
      )
      .map((l) => ({
        orderId,
        variantId: l.variantId,
        quantity: Number(l.quantity),
        unitPrice: Number(l.unitPrice),
        name: l.name?.trim() || undefined,
        sku: l.sku ?? undefined,
        attributes: l.attributes ?? undefined,
      }));

    if (cleaned.length === 0) return;

    setIsSubmitting(true);

    // If your useCreateMutation only sends ONE request,
    // simplest: send sequential requests for each line.
    // (Later you can add a batch endpoint to do this in one call.)
    try {
      for (const payload of cleaned) {
        // addItem signature in your transfer modal is: await createTransfer(payload, setError, onClose)
        await addItem(payload, setSubmitError);
      }
      setIsSubmitting(false);
      setSubmitError(null);
      setLines([{ variantId: "", quantity: 1, unitPrice: 0 }]);
      onClose();
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      mode="create"
      title="Add items"
      description={
        currency
          ? `Add items to this order (${currency}).`
          : "Add items to this order."
      }
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Add items"
    >
      <div className="space-y-2">
        <div className="text-sm font-medium">Items</div>

        <div className="space-y-3">
          {lines.map((line, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end"
            >
              <div className="md:col-span-7 space-y-2">
                <div className="text-xs text-muted-foreground">Variant</div>
                <StoreVariantCombobox
                  storeId={activeStoreId} // adapt as needed
                  value={line.variantId}
                  onChange={(variantId, suggestedPrice) => {
                    setLine(idx, { variantId, unitPrice: suggestedPrice ?? 0 });
                  }}
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <div className="text-xs text-muted-foreground">Qty</div>
                <Input
                  type="number"
                  min={1}
                  value={line.quantity}
                  onChange={(e) =>
                    setLine(idx, { quantity: Number(e.target.value) })
                  }
                  className="w-24"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <div className="text-xs text-muted-foreground">Unit price</div>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={line.unitPrice}
                  onChange={(e) =>
                    setLine(idx, { unitPrice: Number(e.target.value) })
                  }
                />
              </div>

              <div className="md:col-span-1 flex justify-end">
                {lines.length > 1 ? (
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => removeLine(idx)}
                    className="p-0 text-red-500"
                  >
                    Remove
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="clean"
          onClick={addLine}
          className="h-10"
        >
          + Add item
        </Button>
      </div>

      {submitError ? (
        <div className="text-sm text-red-600">{submitError}</div>
      ) : null}
    </FormModal>
  );
}
