"use client";

import { FormModal } from "@/shared/ui/form-modal";
import { Input } from "@/shared/ui/input";
import { useUpdateMutation } from "@/shared/hooks/use-update-mutation";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";

type Props = {
  open: boolean;
  onClose: () => void;

  productVariantId: string;
  locationId: string;

  productName?: string;
  variantTitle?: string | null;
  sku?: string | null;

  // Optional context to show user
  currentOnHand?: number;
};

const schema = z.object({
  delta: z.transform(Number).pipe(z.number()),

  notes: z
    .string()
    .trim()
    .max(255, "Notes cannot exceed 255 characters")
    .optional(),
});

type Values = z.infer<typeof schema>;

export function AdjustInventoryModal({
  open,
  onClose,
  productVariantId,
  locationId,
  productName,
  variantTitle,
  sku,
  currentOnHand,
}: Props) {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { delta: 1, notes: "" },
  });

  const adjust = useUpdateMutation({
    endpoint: `/api/inventory/items/adjust`,
    successMessage: "Inventory adjusted successfully.",
    refetchKey: "inventory", // keep consistent with your cache keys
  });

  const isSubmitting = form.formState.isSubmitting;

  const submit = form.handleSubmit(async (values) => {
    await adjust({
      productVariantId,
      locationId,
      delta: values.delta,
      notes: values.notes?.trim() || undefined,
    });

    form.reset({ delta: 1, notes: "" });
    onClose();
  });

  return (
    <FormModal
      open={open}
      onClose={() => {
        if (!isSubmitting) {
          form.reset({ delta: 1, notes: "" });
          onClose();
        }
      }}
      mode="edit"
      title="Adjust inventory"
      description={
        productName
          ? `${productName}${variantTitle ? ` • ${variantTitle}` : ""}${
              sku ? ` • ${sku}` : ""
            }`
          : "Manually adjust stock level at this location."
      }
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      isSubmitting={isSubmitting}
      submitLabel="Apply"
      cancelLabel="Cancel"
    >
      <Form {...form}>
        {typeof currentOnHand === "number" ? (
          <div className="text-sm text-muted-foreground">
            Current on hand:{" "}
            <span className="font-medium">{currentOnHand}</span>
          </div>
        ) : null}

        <FormField
          control={form.control}
          name="delta"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Delta</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  step={1}
                  placeholder="e.g. 5 or -2"
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
              <div className="text-xs text-muted-foreground">
                Use positive to add stock, negative to reduce.
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (optional)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Reason for adjustment…"
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </Form>
    </FormModal>
  );
}
