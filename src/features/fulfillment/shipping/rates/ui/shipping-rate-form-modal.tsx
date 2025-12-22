/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useGetShippingCarriers } from "../../carriers/hooks/use-shipping-carriers";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

import { useCreateMutation } from "@/shared/hooks/use-create-mutation";
import { useUpdateMutation } from "@/shared/hooks/use-update-mutation";

import { RateSchema, type RateValues } from "../schema/rate.schema";
import type { ShippingZone } from "../../zones/types/shipping-zone.type";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { useSession } from "next-auth/react";

export function ShippingRateFormModal({
  open,
  onClose,
  initialValues,
  mode,
  zones,
}: {
  open: boolean;
  onClose: () => void;
  initialValues?: RateValues;
  mode?: "create" | "edit";
  zones: ShippingZone[];
}) {
  const axios = useAxiosAuth();
  const { data: session } = useSession();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { data: carriers = [] } = useGetShippingCarriers(
    session ?? null,
    axios
  );

  const form = useForm<RateValues>({
    resolver: zodResolver(RateSchema),
    defaultValues: initialValues ?? {
      zoneId: "",
      carrierId: null,
      name: "",
      calc: "flat",
      flatAmount: "",
      isDefault: false,
      isActive: true,
      priority: 0,
      minDeliveryDays: 0,
      maxDeliveryDays: 0,
    },
  });

  useEffect(() => {
    if (!open) return;

    form.reset(
      initialValues ?? {
        zoneId: "",
        carrierId: null,
        name: "",
        calc: "flat",
        flatAmount: "",
        isDefault: false,
        isActive: true,
        priority: 0,
        minDeliveryDays: 0,
        maxDeliveryDays: 0,
      },
      { keepErrors: false }
    );
  }, [open, initialValues, form]);

  const createRate = useCreateMutation({
    endpoint: "/api/shipping/rates",
    successMessage: "Shipping rate created successfully.",
    refetchKey: "shipping rates",
    onSuccess: () => {
      form.reset();
      setSubmitError(null);
    },
  });

  const updateRate = useUpdateMutation({
    endpoint: `/api/shipping/rates/${initialValues?.id}`,
    successMessage: "Shipping rate updated successfully.",
    refetchKey: "shipping rates",
    onSuccess: () => {
      form.reset();
      setSubmitError(null);
    },
  });

  const onSubmit = (values: RateValues) => {
    const payload = {
      ...values,
      carrierId: values.isDefault ? null : values.carrierId ?? null,
      flatAmount: values.calc === "flat" ? values.flatAmount || null : null,
    };

    if (mode === "create") {
      return createRate(payload, setSubmitError, onClose);
    } else if (mode === "edit" && initialValues?.id) {
      return updateRate(
        { id: initialValues.id, ...payload },
        setSubmitError,
        onClose
      );
    }
  };

  const calc = useWatch({ control: form.control, name: "calc" });
  const isDefault = useWatch({ control: form.control, name: "isDefault" });

  useEffect(() => {
    if (isDefault) {
      form.setValue("carrierId", null, { shouldValidate: true });
    }
  }, [isDefault, form]);

  return (
    <FormModal
      open={open}
      title={mode === "edit" ? "Edit Shipping Rate" : "Create Shipping Rate"}
      onClose={onClose}
      onSubmit={form.handleSubmit(onSubmit)}
      submitLabel={mode === "edit" ? "Save changes" : "Create rate"}
      isSubmitting={form.formState.isSubmitting}
    >
      <Form {...form}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              name="zoneId"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Zone</FormLabel>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="h-14">
                        <SelectValue placeholder="Select zone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {zones.map((z) => (
                        <SelectItem key={z.id} value={z.id}>
                          {z.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="carrierId"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Carrier</FormLabel>
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(v) => field.onChange(v || null)}
                    disabled={isDefault}
                  >
                    <FormControl>
                      <SelectTrigger className="h-14">
                        <SelectValue placeholder="No carrier (default rate)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {carriers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Standard"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              name="calc"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Calculation</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="h-14">
                        <SelectValue placeholder="Select calc" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="flat">Flat</SelectItem>
                      <SelectItem value="weight">Weight (tiers)</SelectItem>
                    </SelectContent>
                  </Select>
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
          </div>

          {calc === "flat" && (
            <FormField
              name="flatAmount"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Flat amount</FormLabel>
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
          )}

          <div className="grid grid-cols-2 gap-4">
            <FormField
              name="minDeliveryDays"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Min delivery days</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={(field.value as any) ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="maxDeliveryDays"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max delivery days</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={(field.value as any) ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-center gap-3">
            <FormField
              name="isDefault"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={!!field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">Default rate</FormLabel>
                </FormItem>
              )}
            />

            <FormField
              name="isActive"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={!!field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">Active</FormLabel>
                </FormItem>
              )}
            />
          </div>

          {isDefault && (
            <p className="text-xs text-muted-foreground">
              Default rates apply when no carrier is selected (carrierId must be
              empty).
            </p>
          )}

          {submitError && (
            <p className="text-sm text-destructive">{submitError}</p>
          )}
        </div>
      </Form>
    </FormModal>
  );
}
