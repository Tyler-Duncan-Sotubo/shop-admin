"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import { useGetMySubscription } from "@/features/subscription/hooks/use-subscriptions";
import { isEnterprisePlan } from "@/features/subscription/config/plan-tier";
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
import { FormSheet } from "@/shared/ui/form-sheet";
import { ManualOrderFormModalProps } from "../types/manual-order.type";
import {
  ManualOrderFormValues,
  ManualOrderSchema,
} from "../schema/manual-orders.schema";
import { currencyOptions } from "../../settings/account/config/general-settings.config";
import { useGetStoreLocations } from "@/features/inventory/core/hooks/use-inventory";
import { Checkbox } from "@/shared/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  FaWhatsapp,
  FaInstagram,
  FaFacebook,
  FaAmazon,
} from "react-icons/fa6";
import { MdStorefront } from "react-icons/md";
import type { IconType } from "react-icons";

type ChannelOption =
  | { value: string; label: string; type: "icon"; Icon: IconType; color: string }
  | { value: string; label: string; type: "image"; src: string };

const CHANNEL_OPTIONS: ChannelOption[] = [
  { value: "manual",    label: "Walk-in",   type: "icon",  Icon: MdStorefront, color: "#6366f1" },
  { value: "whatsapp",  label: "WhatsApp",  type: "icon",  Icon: FaWhatsapp,   color: "#25d366" },
  { value: "instagram", label: "Instagram", type: "icon",  Icon: FaInstagram,  color: "#e1306c" },
  { value: "facebook",  label: "Facebook",  type: "icon",  Icon: FaFacebook,   color: "#1877f2" },
  { value: "tiktok",    label: "TikTok",    type: "image", src: "https://centa-hr.s3.eu-west-3.amazonaws.com/companies/019b40f4-a8f1-7b26-84d0-45069767fa8c/stores/019b40f5-7fce-7d21-b580-8724aa347d2b/media/files/tmp/019f1edf-5275-7010-b00c-c1a2c8e8ae8d-tiktok_3621450.png" },
  { value: "chowdeck",  label: "Chowdeck",  type: "image", src: "https://centa-hr.s3.eu-west-3.amazonaws.com/companies/019b40f4-a8f1-7b26-84d0-45069767fa8c/stores/019b40f5-7fce-7d21-b580-8724aa347d2b/media/files/tmp/019f1edf-f372-70b0-9589-593ac589e774-PMuBVFDy_400x400-removebg-preview.png" },
  { value: "glovo",     label: "Glovo",     type: "image", src: "https://centa-hr.s3.eu-west-3.amazonaws.com/companies/019b40f4-a8f1-7b26-84d0-45069767fa8c/stores/019b40f5-7fce-7d21-b580-8724aa347d2b/media/files/tmp/019f1ee1-1c01-77a3-bf28-ad7e2b3d8718-79e17f236280471.Y3JvcCwxMjczLDk5NSwyNzQsMA-removebg-preview.png" },
  { value: "jumia",     label: "Jumia",     type: "image", src: "https://centa-hr.s3.eu-west-3.amazonaws.com/companies/019b40f4-a8f1-7b26-84d0-45069767fa8c/stores/019b40f5-7fce-7d21-b580-8724aa347d2b/media/files/tmp/019f1ee0-1a58-7105-842c-c45a1b0e3a87-Jumia_Group-Logo.png" },
  { value: "konga",     label: "Konga",     type: "image", src: "https://centa-hr.s3.eu-west-3.amazonaws.com/companies/019b40f4-a8f1-7b26-84d0-45069767fa8c/stores/019b40f5-7fce-7d21-b580-8724aa347d2b/media/files/tmp/019f1ee0-794d-7810-8c6a-52738dd9c9ca-Konga-Logo-1000-x-700-removebg-preview.png" },
  { value: "amazon",    label: "Amazon",    type: "icon",  Icon: FaAmazon,     color: "#ff9900" },
];

export function ManualOrderFormSheet({
  open,
  mode,
  order,
  onClose,
  onSubmit,
}: ManualOrderFormModalProps) {
  const { data: session } = useSession();
  const axios = useAxiosAuth();
  const { activeStoreId } = useStoreScope();

  const { data: subscription } = useGetMySubscription(session, axios);
  const isCustomPlan = isEnterprisePlan(subscription?.plan.name);

  const { data: locations = [], isLoading: locationsLoading } =
    useGetStoreLocations(activeStoreId, session, axios);

  const form = useForm<ManualOrderFormValues>({
    resolver: zodResolver(ManualOrderSchema),
    defaultValues: {
      currency: "NGN",
      channel: "manual",
      originInventoryLocationId: "",
      fulfillmentModel: "stock_first",
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
        fulfillmentModel: isCustomPlan ? "payment_first" : "stock_first",
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
    <FormSheet
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
          {/* Channel — icon grid */}
          <FormField
            control={form.control}
            name="channel"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mb-2">Sales Channel</FormLabel>
                <div className="grid grid-cols-4 gap-3">
                  {CHANNEL_OPTIONS.map((opt) => {
                    const selected = (field.value ?? "manual") === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => field.onChange(opt.value)}
                        className={cn(
                          "flex flex-col items-center gap-2 rounded-lg p-4 text-center font-bold transition-colors cursor-pointer",
                          selected
                            ? "border border-primary bg-primary/10"
                            : "shadow-sm border border-secondary hover:bg-muted/50",
                        )}
                      >
                        {opt.type === "icon" ? (
                          <opt.Icon size={22} color={opt.color} />
                        ) : (
                          <img
                            src={opt.src}
                            alt={opt.label}
                            className="w-6 h-6 object-contain"
                          />
                        )}
                        <span
                          className={cn(
                            "text-xs font-semibold leading-tight",
                            selected ? "text-primary" : "text-muted-foreground",
                          )}
                        >
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
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

          {/* Fulfillment Model — Custom plan only */}
          {isCustomPlan && (
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
                      <SelectItem value="payment_first">
                        Payment First
                      </SelectItem>
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
          )}

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
              <FormItem className="flex items-start gap-3 p-3 border rounded-lg">
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
    </FormSheet>
  );
}
