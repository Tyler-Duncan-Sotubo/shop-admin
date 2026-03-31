"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
  FormDescription,
} from "@/shared/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { FormModal } from "@/shared/ui/form-modal";
import { ManualOrderFormModalProps } from "../types/manual-order.type";
import {
  ManualOrderFormValues,
  ManualOrderSchema,
} from "../schema/manual-orders.schema";
import { currencyOptions } from "../../settings/account/config/general-settings.config";
import { useGetStoreLocations } from "@/features/inventory/core/hooks/use-inventory";
import { AdminCustomerCombobox } from "@/shared/ui/customer-combobox";
import { Checkbox } from "@/shared/ui/checkbox";

export function ManualOrderFormModal({
  open,
  mode,
  order,
  onClose,
  onSubmit,
}: ManualOrderFormModalProps) {
  const { data: session } = useSession();
  const axios = useAxiosAuth();
  const { activeStoreId } = useStoreScope();

  const { data: locations = [], isLoading: locationsLoading } =
    useGetStoreLocations(activeStoreId, session, axios);

  const form = useForm<ManualOrderFormValues>({
    resolver: zodResolver(ManualOrderSchema),
    defaultValues: {
      currency: "NGN",
      channel: "manual",
      originInventoryLocationId: "",
      fulfillmentModel: "payment_first",
      customerId: null,
      shippingAddress: null,
      billingAddress: null,
      skipDraft: false,
    },
    mode: "onChange",
  });

  const defaultOriginId = useMemo(() => {
    const first = locations?.[0];
    return first?.locationId ?? "";
  }, [locations]);

  useEffect(() => {
    if (mode !== "create") return;
    if (open && !order) {
      form.reset({
        currency: "NGN",
        channel: "manual",
        originInventoryLocationId: "",
        fulfillmentModel: "payment_first",
        customerId: null,
        shippingAddress: null,
        billingAddress: null,
        skipDraft: false,
      });
    }
  }, [open, mode, order, form]);

  useEffect(() => {
    if (!open) return;
    const current = form.getValues("originInventoryLocationId");
    if (!current && defaultOriginId) {
      form.setValue("originInventoryLocationId", defaultOriginId, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [defaultOriginId, open, form]);

  const handleSubmit = async (values: ManualOrderFormValues) => {
    await onSubmit({
      ...values,
      storeId: activeStoreId ?? null,
    });
  };

  return (
    <FormModal
      open={open}
      mode={mode}
      title="Create Manual Order"
      onClose={onClose}
      onSubmit={form.handleSubmit(handleSubmit)}
      isSubmitting={form.formState.isSubmitting}
      submitLabel="Create Order"
    >
      <Form {...form}>
        <div className="space-y-4">
          {/* Customer */}
          <FormField
            control={form.control}
            name="customerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer (optional)</FormLabel>
                <FormControl>
                  <AdminCustomerCombobox
                    storeId={activeStoreId}
                    value={field.value ?? ""}
                    onChange={(id) => field.onChange(id || null)}
                    placeholder="Select a customer (optional)"
                    disabled={!activeStoreId}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Channel */}
          <FormField
            control={form.control}
            name="channel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Channel</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? "manual"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select channel" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="pos">POS</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Currency */}
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Currency</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {currencyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Fulfillment Model */}
          <FormField
            control={form.control}
            name="fulfillmentModel"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Fulfillment Model</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select fulfillment model" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="payment_first">Payment First</SelectItem>
                    <SelectItem value="stock_first">Stock First</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  {field.value === "payment_first"
                    ? "Client pays first, then you procure and fulfil. Stock is checked at fulfillment."
                    : "Stock must be available before submitting for payment."}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Origin Inventory Location */}
          <FormField
            control={form.control}
            name="originInventoryLocationId"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Origin Inventory Location</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? ""}
                  disabled={!activeStoreId || locationsLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          locationsLoading
                            ? "Loading locations..."
                            : "Select a location"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {locations.map(
                      (loc: { locationId: string; name: string }) => (
                        <SelectItem key={loc.locationId} value={loc.locationId}>
                          {loc.name}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
                {!locationsLoading &&
                  activeStoreId &&
                  locations.length === 0 && (
                    <p className="text-xs text-destructive">
                      No locations found for this store.
                    </p>
                  )}
              </FormItem>
            )}
          />
          {/* Skip Draft */}
          <FormField
            control={form.control}
            name="skipDraft"
            render={({ field }) => (
              <FormItem className="flex items-start gap-3 rounded-lg border p-3">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-0.5">
                  <FormLabel>Ready to invoice</FormLabel>
                  <FormDescription>
                    Skip draft and immediately create an invoice for this order.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>
      </Form>
    </FormModal>
  );
}
