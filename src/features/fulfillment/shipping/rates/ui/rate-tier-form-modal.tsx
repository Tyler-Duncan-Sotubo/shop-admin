/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FormModal } from "@/shared/ui/form-modal";
import { Input } from "@/shared/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/ui/form";
import { useCreateMutation } from "@/shared/hooks/use-create-mutation";
import { useUpdateMutation } from "@/shared/hooks/use-update-mutation";
import {
  RateTierSchema,
  type RateTierValues,
} from "../schema/rate-tier.schema";

export function RateTierFormModal({
  open,
  onClose,
  mode,
  initialValues,
  rateId,
}: {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  initialValues?: Partial<RateTierValues>;
  rateId: string;
}) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<RateTierValues>({
    resolver: zodResolver(RateTierSchema),
    defaultValues: {
      rateId,
      minWeightGrams: 0,
      maxWeightGrams: 0,
      amount: "",
      priority: 0,
      ...(initialValues ?? {}),
    } as any,
  });

  useEffect(() => {
    if (!open) return;

    form.reset(
      {
        rateId,
        minWeightGrams: 0,
        maxWeightGrams: 0,
        amount: "",
        priority: 0,
        ...(initialValues ?? {}),
      } as any,
      { keepErrors: false }
    );
  }, [open, initialValues, form, rateId]);

  const createTier = useCreateMutation({
    endpoint: "/api/shipping/rates/tiers",
    successMessage: "Tier added successfully.",
    refetchKey: "shipping rate tiers",
  });

  // Requires backend: PATCH /api/shipping/rates/tiers/:tierId
  const updateTier = useUpdateMutation({
    endpoint: `/api/shipping/rates/tiers/${initialValues?.id}`,
    successMessage: "Tier updated successfully.",
    refetchKey: "shipping rate tiers",
  });

  const onSubmit = (values: RateTierValues) => {
    const payload = {
      ...values,
      rateId,
    };

    if (mode === "create") {
      return createTier(payload, setSubmitError, onClose);
    }

    if (mode === "edit" && initialValues?.id) {
      return updateTier(
        { id: initialValues.id, ...payload },
        setSubmitError,
        onClose
      );
    }
  };

  // Helper: Input -> number conversion (prevents “must be an integer” errors)
  const numOnChange =
    (onChange: (v: any) => void) => (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange(e.target.value === "" ? 0 : Number(e.target.value));

  return (
    <FormModal
      open={open}
      title={mode === "edit" ? "Edit Tier" : "Add Tier"}
      submitLabel={mode === "edit" ? "Save changes" : "Add tier"}
      onClose={onClose}
      onSubmit={form.handleSubmit(onSubmit)}
      isSubmitting={form.formState.isSubmitting}
    >
      <Form {...form}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              name="minWeightGrams"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Min weight (kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value ?? 0}
                      onChange={numOnChange(field.onChange)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="maxWeightGrams"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Max weight (kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value ?? 0}
                      onChange={numOnChange(field.onChange)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            name="amount"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Amount</FormLabel>
                <FormControl>
                  <Input
                    placeholder="1500"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="priority"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={field.value ?? 0}
                    onChange={numOnChange(field.onChange)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {submitError && (
            <p className="text-sm text-destructive">{submitError}</p>
          )}
        </div>
      </Form>
    </FormModal>
  );
}
