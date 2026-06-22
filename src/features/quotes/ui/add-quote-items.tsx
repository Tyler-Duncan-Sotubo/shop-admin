"use client";

import { useState } from "react";
import { VariantPickerSheet, PickedItem } from "@/shared/ui/variant-picker-sheet";
import { useCreateMutation } from "@/shared/hooks/use-create-mutation";
import { useStoreScope } from "@/lib/providers/store-scope-provider";

type Props = {
  open: boolean;
  onClose: () => void;
  quoteId: string;
};

type AddQuoteItemPayload = {
  quoteId: string;
  items: { variantId: string; quantity: number }[];
};

export function AddQuoteItemsSheet({ open, onClose, quoteId }: Props) {
  const { activeStoreId } = useStoreScope();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addItems = useCreateMutation<AddQuoteItemPayload>({
    endpoint: `/api/quotes/${quoteId}/items`,
    successMessage: "Items added",
    refetchKey: "quotes",
    onSuccess: () => setIsSubmitting(false),
    onError: () => setIsSubmitting(false),
  });

  const handleSubmit = async (items: PickedItem[]) => {
    setIsSubmitting(true);
    setError(null);
    await addItems(
      { quoteId, items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })) },
      setError,
      onClose,
    );
    setIsSubmitting(false);
  };

  return (
    <VariantPickerSheet
      storeId={activeStoreId}
      open={open}
      onClose={onClose}
      title="Add items to quote"
      description="Select variants and quantities to add to this quote."
      requireStock={false}
      isSubmitting={isSubmitting}
      submitLabel="Add"
      error={error}
      onSubmit={handleSubmit}
    />
  );
}
