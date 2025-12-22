"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/shared/ui/input";
import { FormModal } from "@/shared/ui/form-modal";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/shared/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

import { InventoryLocationFormModalProps } from "../types/inventory-location.type";
import {
  InventoryLocationSchema,
  InventoryLocationFormValues,
} from "../schema/inventory-locations.schema";
import { codeify } from "@/shared/utils/codeify";
import { NG_REGION_CODES } from "@/shared/constants/ng-regions";

export function InventoryLocationFormModal({
  open,
  mode,
  location,
  onClose,
  onSubmit,
  submitError,
}: InventoryLocationFormModalProps) {
  const form = useForm<InventoryLocationFormValues>({
    resolver: zodResolver(InventoryLocationSchema),
    defaultValues: {
      name: "",
      code: "",
      type: "warehouse",
      addressLine1: "",
      addressLine2: "",
      city: "",
      region: "",
      postalCode: "",
      country: "",
      isActive: true,
    },
    mode: "onChange",
  });

  // Watch name for auto-code generation
  const nameValue = useWatch({
    control: form.control,
    name: "name",
  });

  // Auto-generate code (create only)
  useEffect(() => {
    if (mode === "edit") return;

    const newCode = codeify(nameValue || "");
    if (form.getValues("code") !== newCode) {
      form.setValue("code", newCode, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [nameValue, mode, form]);

  // Populate form on edit / reset on create
  useEffect(() => {
    if (mode === "edit" && location) {
      form.reset({
        name: location.name,
        code: location.code ?? "",
        type: location.type,
        addressLine1: location.addressLine1 ?? "",
        addressLine2: location.addressLine2 ?? "",
        city: location.city ?? "",
        region: location.region ?? "",
        postalCode: location.postalCode ?? "",
        country: location.country ?? "",
        isActive: location.isActive,
      });
    }

    if (mode === "create" && !location) {
      form.reset({
        name: "",
        code: "",
        type: "warehouse",
        addressLine1: "",
        addressLine2: "",
        city: "",
        region: "",
        postalCode: "",
        country: "",
        isActive: true,
      });
    }
  }, [mode, location, form]);

  const handleSubmit = async (values: InventoryLocationFormValues) => {
    await onSubmit(values);
    form.reset();
  };

  return (
    <FormModal
      open={open}
      mode={mode}
      title={mode === "create" ? "Create Location" : "Edit Location"}
      onClose={onClose}
      onSubmit={form.handleSubmit(handleSubmit)}
      isSubmitting={form.formState.isSubmitting}
      submitLabel={mode === "create" ? "Create Location" : "Save Changes"}
    >
      <Form {...form}>
        <div className="space-y-4">
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Main Warehouse"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto items-start">
            {/* Code (auto, disabled) */}
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="MAIN-WAREHOUSE"
                      {...field}
                      value={field.value ?? ""}
                      disabled
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Auto-generated from the location name.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-14 px-3 w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="warehouse">Warehouse</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Address */}
          <FormField
            control={form.control}
            name="addressLine1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address line 1</FormLabel>
                <FormControl>
                  <Input
                    placeholder="123 Industrial Way"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="addressLine2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address line 2</FormLabel>
                <FormControl>
                  <Input placeholder="Suite 4B" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="Lagos" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger className="h-14 px-3 w-full">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {NG_REGION_CODES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postal code</FormLabel>
                  <FormControl>
                    <Input placeholder="100001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="Nigeria" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Active */}
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={!!field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                </FormControl>
                <FormLabel className="font-normal">
                  Location is active
                </FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {submitError && (
          <p className="text-sm text-destructive">{submitError}</p>
        )}
      </Form>
    </FormModal>
  );
}
