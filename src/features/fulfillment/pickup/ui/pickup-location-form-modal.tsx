/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import type { PickupLocation } from "../types/pickup-location.type";
import {
  PickupLocationSchema,
  type PickupLocationValues,
} from "../schema/pickup-location.schema";
import { useGetStoreLocations } from "@/features/inventory/core/hooks/use-inventory";
import { NG_REGION_CODES } from "@/shared/constants/ng-regions";

type Mode = "create" | "edit";

export function PickupLocationFormModal({
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
  initialValues?: PickupLocation | null;
  onSubmit: (values: PickupLocationValues) => Promise<void>;
  isSubmitting?: boolean;
}) {
  const { data: session } = useSession();
  const axios = useAxiosAuth();
  const { activeStoreId } = useStoreScope();

  const { data: locations = [] } = useGetStoreLocations(
    activeStoreId,
    session,
    axios,
  );

  // reuse your sorting preference: warehouse → primary → name
  const locationOptions = useMemo(() => {
    const active = locations.filter((l: any) => l.isActive);
    return [...active].sort((a: any, b: any) => {
      const aWarehouse = a.type === "warehouse" ? 0 : 1;
      const bWarehouse = b.type === "warehouse" ? 0 : 1;
      if (aWarehouse !== bWarehouse) return aWarehouse - bWarehouse;

      const aPrimary = a.isPrimary ? 0 : 1;
      const bPrimary = b.isPrimary ? 0 : 1;
      if (aPrimary !== bPrimary) return aPrimary - bPrimary;

      return (a.name ?? "").localeCompare(b.name ?? "");
    });
  }, [locations]);

  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<PickupLocationValues>({
    resolver: zodResolver(PickupLocationSchema),
    defaultValues: {
      isActive: true,
      instructions: null,
      name: "",
      inventoryLocationId: "",
      address1: "",
      address2: null,
      state: "",
    },
  });

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && initialValues) {
      form.reset(
        {
          id: initialValues.id,
          name: initialValues.name ?? "",
          inventoryLocationId: initialValues.inventoryLocationId ?? "",
          isActive: Boolean(initialValues.isActive),
          instructions: initialValues.instructions ?? null,
          address1: initialValues.address1 ?? "",
          address2: initialValues.address2 ?? null,
          state: initialValues.state ?? "",
        },
        { keepErrors: false },
      );
    } else {
      // set a sensible default inventory origin (warehouse/primary) if available
      const defaultLocId = locationOptions[0]?.locationId ?? "";

      form.reset(
        {
          name: "",
          inventoryLocationId: defaultLocId,
          isActive: true,
          instructions: null,
          address1: "",
          address2: null,
          state: "",
        },
        { keepErrors: false },
      );
    }
  }, [open, mode, initialValues, form, locationOptions]);

  const handleSubmit = async (values: PickupLocationValues) => {
    try {
      await onSubmit(values);
      form.reset();
      setSubmitError(null);
      onClose();
    } catch (err: any) {
      setSubmitError(err?.message ?? "Failed to save pickup location");
    }
  };

  return (
    <FormModal
      open={open}
      title={
        mode === "edit" ? "Edit Pickup Location" : "Create Pickup Location"
      }
      submitLabel={mode === "edit" ? "Save Changes" : "Create"}
      onClose={onClose}
      onSubmit={form.handleSubmit(handleSubmit)}
      isSubmitting={isSubmitting}
    >
      <Form {...form}>
        <div className="space-y-4">
          {/* Top row: Name + Inventory origin */}

          {/* Top row: Name + Inventory origin */}
          <div className="grid grid-cols-2 gap-3">
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Lekki" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="inventoryLocationId"
              control={form.control}
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>Origin</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {locationOptions.map((l: any) => (
                          <SelectItem key={l.locationId} value={l.locationId}>
                            {l.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Address card */}
          <div className="rounded-lg border p-4">
            <div className="mb-3">
              <p className="text-sm font-semibold">Pickup Address</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField
                name="address1"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="md:col-span-3">
                    <FormLabel>Address line 1</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Full pickup address (store, street, landmark, etc.)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="address2"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Address line 2 (optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Suite, floor, additional directions"
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
                name="state"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <Select
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="All states" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {NG_REGION_CODES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s.replace(/_/g, " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Active */}
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
