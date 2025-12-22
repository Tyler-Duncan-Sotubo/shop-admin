"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  StoreLocationsSchema,
  StoreLocationsFormValues,
} from "../schema/store-locations.schema";
import { Form, FormMessage } from "@/shared/ui/form";
import { Checkbox } from "@/shared/ui/checkbox";
import { Badge } from "@/shared/ui/badge";
import { FormModal } from "@/shared/ui/form-modal";
import { StoreLocationsModalProps } from "../types/store-locations.type";
import { useState } from "react";
import { FaWarehouse } from "react-icons/fa6";
import { EmptyState } from "@/shared/ui/empty-state";

export function StoreLocationsFormModal({
  open,
  allLocations,
  assignedLocationIds,
  onClose,
  onSubmit,
  submitError,
}: StoreLocationsModalProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<StoreLocationsFormValues>({
    resolver: zodResolver(StoreLocationsSchema),
    defaultValues: {
      locationIds: assignedLocationIds,
    },
  });

  const selected = useWatch({
    control: form.control,
    name: "locationIds",
  });

  const warehouses = allLocations.filter(
    (l) => l.type === "warehouse" && selected.includes(l.id)
  );
  const hasLocations = allLocations.length > 0;

  const toggle = (id: string) => {
    const current = form.getValues("locationIds");
    form.setValue(
      "locationIds",
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
      { shouldValidate: true }
    );
  };

  const submit = async (values: StoreLocationsFormValues) => {
    if (warehouses.length === 0) {
      setFormError("At least one warehouse must be selected");
      return;
    }

    if (warehouses.length > 1) {
      setFormError("Only one warehouse can be selected as primary");
      return;
    }

    await onSubmit(values.locationIds);
  };

  return (
    <FormModal
      open={open}
      mode="edit"
      title="Assign Inventory Locations"
      onClose={onClose}
      onSubmit={form.handleSubmit(submit)}
      isSubmitting={form.formState.isSubmitting}
      submitLabel="Save locations"
      showFooter={allLocations.length === 0 ? false : true}
    >
      <Form {...form}>
        <div className="space-y-3">
          {allLocations.map((loc) => {
            const checked = selected.includes(loc.id);

            return (
              <div
                key={loc.id}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggle(loc.id)}
                  />
                  <div>
                    <p className="font-medium">{loc.name}</p>
                    {loc.code && (
                      <p className="text-xs text-muted-foreground">
                        {loc.code}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline">{loc.type}</Badge>
                  {loc.type === "warehouse" && checked && (
                    <Badge>Primary</Badge>
                  )}
                </div>
              </div>
            );
          })}

          <FormMessage />
        </div>

        {submitError && (
          <p className="text-sm text-destructive">{submitError}</p>
        )}
        {formError && <p className="text-sm text-destructive">{formError}</p>}
      </Form>

      {!hasLocations && (
        <EmptyState
          icon={<FaWarehouse className="h-6 w-6 text-muted-foreground" />}
          title="No locations available"
          description="Create a warehouse or store location first, then come back to assign it."
          primaryAction={{
            label: "Create location",
            href: "/inventory/locations",
          }}
          secondaryAction={{ label: "Close", onClick: onClose }}
        />
      )}
    </FormModal>
  );
}
