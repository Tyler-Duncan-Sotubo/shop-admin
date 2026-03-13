"use client";

import { FormEvent, useState } from "react";
import { FormModal } from "@/shared/ui/form-modal";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useCreateMutation } from "@/shared/hooks/use-create-mutation";
import { StoreVariantCombobox } from "@/shared/ui/store-variant-combobox";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import { Trash2, Plus } from "lucide-react";
import { Separator } from "@/shared/ui/separator";

type Props = {
  open: boolean;
  onClose: () => void;
  quoteId: string;
};

type Line = {
  variantId: string;
  quantity: number;
};

type AddQuoteItemPayload = {
  quoteId: string;
  items: {
    variantId: string;
    quantity: number;
  }[];
};

export function AddQuoteItemsModal({ open, onClose, quoteId }: Props) {
  const { activeStoreId } = useStoreScope();

  const [lines, setLines] = useState<Line[]>([{ variantId: "", quantity: 1 }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const addItem = useCreateMutation<AddQuoteItemPayload>({
    endpoint: `/api/quotes/${quoteId}/items`,
    successMessage: "Items added",
    refetchKey: "quotes",
    onSuccess: () => {
      setSubmitError(null);
      setIsSubmitting(false);
      setLines([{ variantId: "", quantity: 1 }]);
      onClose();
    },
    onError: () => setIsSubmitting(false),
  });

  const setLine = (idx: number, patch: Partial<Line>) => {
    setLines((prev) =>
      prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)),
    );
  };

  const addLine = () =>
    setLines((prev) => [...prev, { variantId: "", quantity: 1 }]);

  const removeLine = (idx: number) =>
    setLines((prev) => prev.filter((_, i) => i !== idx));

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const cleaned = lines
      .filter((l) => l.variantId && Number(l.quantity) > 0)
      .map((l) => ({
        variantId: l.variantId,
        quantity: Number(l.quantity),
      }));

    if (cleaned.length === 0) return;

    setIsSubmitting(true);

    try {
      await addItem({ quoteId, items: cleaned }, setSubmitError);
      setIsSubmitting(false);
      setSubmitError(null);
      setLines([{ variantId: "", quantity: 1 }]);
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
      title="Add items to quote"
      description="Select variants and quantities to add to this quote."
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      submitLabel={`Add ${lines.filter((l) => l.variantId).length || ""} item${lines.filter((l) => l.variantId).length === 1 ? "" : "s"}`}
      contentClassName="max-w-3xl"
    >
      <div className="space-y-4">
        {/* column headers */}
        <div className="hidden md:grid md:grid-cols-12 gap-2 px-1">
          <div className="md:col-span-9 text-xs text-muted-foreground">
            Variant
          </div>
          <div className="md:col-span-2 text-xs text-muted-foreground">Qty</div>
          <div className="md:col-span-1" />
        </div>

        <div className="space-y-2">
          {lines.map((line, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center bg-muted/30 rounded-lg p-2"
            >
              <div className="md:col-span-9">
                <StoreVariantCombobox
                  storeId={activeStoreId}
                  value={line.variantId}
                  onChange={(variantId) => setLine(idx, { variantId })}
                  requireStock={false}
                />
              </div>

              <div className="md:col-span-2">
                <Input
                  type="number"
                  min={1}
                  value={line.quantity}
                  onChange={(e) =>
                    setLine(idx, { quantity: Number(e.target.value) })
                  }
                  className="h-9 text-sm"
                  placeholder="Qty"
                />
              </div>

              <div className="md:col-span-1 flex justify-end">
                {lines.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLine(idx)}
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addLine}
          className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          Add another item
        </Button>

        {submitError && (
          <>
            <Separator />
            <p className="text-xs text-destructive">{submitError}</p>
          </>
        )}
      </div>
    </FormModal>
  );
}
