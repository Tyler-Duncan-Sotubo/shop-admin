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

import {
  ShippingCarrierSchema,
  ShippingCarrierFormValues,
} from "../schema/shipping-carrier.schema";
import { useCreateMutation } from "@/shared/hooks/use-create-mutation";
import { useUpdateMutation } from "@/shared/hooks/use-update-mutation";

export function ShippingCarrierFormModal({
  open,
  onClose,
  mode,
  initialValues,
}: {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  initialValues?: ShippingCarrierFormValues;
}) {
  const form = useForm<ShippingCarrierFormValues>({
    resolver: zodResolver(ShippingCarrierSchema),
    defaultValues: initialValues ?? {
      name: "",
      providerKey: "",
      isActive: true,
    },
  });

  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    form.reset(initialValues ?? { name: "", providerKey: "", isActive: true }, {
      keepErrors: false,
    });
  }, [open, initialValues, form]);

  const createCarrier = useCreateMutation({
    endpoint: "/api/shipping/carriers",
    successMessage: "Carrier created successfully",
    refetchKey: "shipping carriers",
  });

  const updateCarrier = useUpdateMutation({
    endpoint: `/api/shipping/carriers/${initialValues?.id}`,
    successMessage: "Carrier updated successfully",
    refetchKey: "shipping carriers",
  });

  const onSubmit = (values: ShippingCarrierFormValues) => {
    if (mode === "create") {
      return createCarrier(values, setSubmitError, onClose);
    }
    if (mode === "edit" && initialValues?.id) {
      return updateCarrier(
        { id: initialValues.id, ...values },
        setSubmitError,
        onClose
      );
    }
  };

  return (
    <FormModal
      open={open}
      title={mode === "edit" ? "Edit Carrier" : "Create Carrier"}
      submitLabel={mode === "edit" ? "Save changes" : "Create carrier"}
      onClose={onClose}
      onSubmit={form.handleSubmit(onSubmit)}
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
                <Input placeholder="DHL Express" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="providerKey"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Provider key</FormLabel>
              <FormControl>
                <Input placeholder="dhl" {...field} />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                Lowercase, no spaces (used internally)
              </p>
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
