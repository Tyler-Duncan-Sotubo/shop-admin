"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/shared/ui/input";
import { FormModal } from "@/shared/ui/form-modal";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/ui/form";
import { Schema, Values } from "../schema";
import { useEffect, useState } from "react";
import { useCreateMutation } from "@/shared/hooks/use-create-mutation";
import { useUpdateMutation } from "@/shared/hooks/use-update-mutation";
import { useStoreScope } from "@/lib/providers/store-scope-provider";

export function ShippingZoneFormModal({
  open,
  onClose,
  initialValues,
  mode,
}: {
  open: boolean;
  onClose: () => void;
  initialValues?: Values;
  mode?: "create" | "edit";
}) {
  const { activeStoreId } = useStoreScope();
  const form = useForm<Values>({
    resolver: zodResolver(Schema),
    defaultValues: initialValues ?? { name: "", priority: 0, isActive: true },
  });

  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    form.reset(initialValues ?? { name: "", priority: 0, isActive: true }, {
      keepErrors: false,
    });
  }, [open, initialValues, form]);

  const createZone = useCreateMutation({
    endpoint: "/api/shipping/zones",
    successMessage: "Shipping zone created successfully.",
    refetchKey: "shipping zones",
  });

  const updateZone = useUpdateMutation({
    endpoint: `/api/shipping/zones/${initialValues?.id}`,
    successMessage: "Shipping zone updated successfully",
    refetchKey: "shipping zones",
  });

  const onSubmit = (values: Values) => {
    if (mode === "create") {
      return createZone(
        { ...values, storeId: activeStoreId },
        setSubmitError,
        onClose
      );
    } else if (mode === "edit" && initialValues) {
      return updateZone(
        { id: initialValues.id, ...values },
        setSubmitError,
        onClose
      );
    }
  };

  return (
    <FormModal
      open={open}
      title={mode === "edit" ? "Edit Shipping Zone" : "Create Shipping Zone"}
      onClose={onClose}
      onSubmit={form.handleSubmit(onSubmit)}
      submitLabel={mode === "edit" ? "Save changes" : "Create zone"}
      isSubmitting={form.formState.isSubmitting}
    >
      <Form {...form}>
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Name</FormLabel>
              <FormControl>
                <Input placeholder="Lagos Metro" {...field} />
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
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {submitError && (
          <p className="text-sm text-destructive">{submitError}</p>
        )}
      </Form>
    </FormModal>
  );
}
