"use client";

import { useState } from "react";
import { VariantPickerSheet, PickedItem } from "@/shared/ui/variant-picker-sheet";
import { useCreateMutation } from "@/shared/hooks/use-create-mutation";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import type { InventoryOverviewRow } from "../../inventory/core/types/inventory.type";

type Props = {
  open: boolean;
  onClose: () => void;
  orderId: string;
  currency?: string;
  rows: InventoryOverviewRow[];
};

type AddManualOrderItemPayload = {
  orderId: string;
  variantId: string;
  quantity: number;
};

export function AddManualOrderItemsSheet({
  open,
  onClose,
  orderId,
  currency,
}: Props) {
  const { activeStoreId } = useStoreScope();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addItem = useCreateMutation<AddManualOrderItemPayload>({
    endpoint: "/api/orders/manual/items",
    successMessage: "Item(s) added",
    refetchKey: "orders",
    onSuccess: () => setIsSubmitting(false),
    onError: () => setIsSubmitting(false),
  });

  const handleSubmit = async (items: PickedItem[]) => {
    setIsSubmitting(true);
    setError(null);
    for (const item of items) {
      await addItem(
        { orderId, variantId: item.variantId, quantity: item.quantity },
        setError,
      );
    }
    setIsSubmitting(false);
    onClose();
  };

  return (
    <VariantPickerSheet
      storeId={activeStoreId}
      open={open}
      onClose={onClose}
      title="Add items to order"
      description={currency ? `Prices in ${currency}` : undefined}
      requireStock={false}
      isSubmitting={isSubmitting}
      submitLabel="Add"
      error={error}
      onSubmit={handleSubmit}
    />
  );
}
