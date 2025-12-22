/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormModal } from "@/shared/ui/form-modal";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";
import type { Tax } from "../types/tax.type";
import { TaxSchema, type TaxValues, bpsToPercent } from "../schema/tax.schema";

type Mode = "create" | "edit";

export function TaxFormModal({
  open,
  onClose,
  mode,
  initialValues,
  onSubmit,
  isSubmitting,
}: {
  open: boolean;
  onClose: () => void;
  mode: Mode;
  initialValues?: Tax | null;
  onSubmit: (values: TaxValues) => Promise<void>;
  isSubmitting?: boolean;
}) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<TaxValues>({
    resolver: zodResolver(TaxSchema),
    defaultValues: {
      name: "",
      code: null,
      ratePercent: 0,
      isInclusive: false,
      isDefault: false,
      isActive: true,
    },
  });

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && initialValues) {
      form.reset(
        {
          id: initialValues.id,
          name: initialValues.name ?? "",
          code: initialValues.code ?? null,
          ratePercent: bpsToPercent(initialValues.rateBps),
          isInclusive: !!initialValues.isInclusive,
          isDefault: !!initialValues.isDefault,
          isActive: initialValues.isActive ?? true,
        },
        { keepErrors: false }
      );
    } else {
      form.reset(
        {
          name: "",
          code: null,
          ratePercent: 0,
          isInclusive: false,
          isDefault: false,
          isActive: true,
        },
        { keepErrors: false }
      );
    }
  }, [open, mode, initialValues, form]);

  const handleSubmit = async (values: TaxValues) => {
    try {
      await onSubmit(values);
      setSubmitError(null);
      form.reset();
      onClose();
    } catch (err: any) {
      setSubmitError(err?.message ?? "Failed to save tax");
    }
  };

  return (
    <FormModal
      open={open}
      title={mode === "edit" ? "Edit Tax" : "Create Tax"}
      submitLabel={mode === "edit" ? "Save Changes" : "Create"}
      onClose={onClose}
      onSubmit={form.handleSubmit(handleSubmit)}
      isSubmitting={isSubmitting}
    >
      <Form {...form}>
        <div className="space-y-4">
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input className="h-14" placeholder="VAT" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="code"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Code (optional)</FormLabel>
                <FormControl>
                  <Input
                    className="h-14"
                    placeholder="VAT_NG"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(e.target.value ? e.target.value : null)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="ratePercent"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rate (%)</FormLabel>
                <FormControl>
                  <Input
                    className="h-14"
                    type="number"
                    inputMode="decimal"
                    placeholder="7.5"
                    value={Number.isFinite(field.value) ? field.value : 0}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? 0 : Number(e.target.value)
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="isInclusive"
            control={form.control}
            render={({ field }) => (
              <FormItem className="flex h-14 items-center justify-between rounded-md border px-4">
                <FormLabel className="mb-0">Inclusive tax</FormLabel>
                <FormControl>
                  <Switch
                    checked={!!field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            name="isDefault"
            control={form.control}
            render={({ field }) => (
              <FormItem className="flex h-14 items-center justify-between rounded-md border px-4">
                <FormLabel className="mb-0">Default tax</FormLabel>
                <FormControl>
                  <Switch
                    checked={!!field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            name="isActive"
            control={form.control}
            render={({ field }) => (
              <FormItem className="flex h-14 items-center justify-between rounded-md border px-4">
                <FormLabel className="mb-0">Active</FormLabel>
                <FormControl>
                  <Switch
                    checked={!!field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {submitError && <p className="text-sm text-red-600">{submitError}</p>}
        </div>
      </Form>
    </FormModal>
  );
}
