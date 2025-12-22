"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/shared/ui/input";
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
import { FormModal } from "@/shared/ui/form-modal";

import { StoreFormModalProps } from "../types/store.type";
import {
  currencyOptions,
  defaultLocaleOptions,
} from "../../settings/account/config/general-settings.config";
import { StoreFormValues, StoreSchema } from "../schema/stores.schema";
import { slugify } from "@/shared/utils/slugify";

export function StoreFormModal({
  open,
  mode,
  store,
  onClose,
  onSubmit,
}: StoreFormModalProps) {
  const form = useForm<StoreFormValues>({
    resolver: zodResolver(StoreSchema),
    defaultValues: {
      name: "",
      slug: "",
      defaultCurrency: "NGN",
      defaultLocale: "en-NG",
      isActive: true,
    },
    mode: "onChange",
  });

  // Watch name as user types
  const nameValue = useWatch({
    control: form.control,
    name: "name",
  });

  // Auto-generate slug from name (for create mode)
  useEffect(() => {
    if (mode === "edit") return;

    const newSlug = slugify(nameValue || "");
    if (form.getValues("slug") !== newSlug) {
      form.setValue("slug", newSlug, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [nameValue, mode, form]);

  // Populate form when editing / creating
  useEffect(() => {
    if (store && mode === "edit") {
      form.reset({
        name: store.name,
        slug: store.slug,
        defaultCurrency: store.defaultCurrency ?? "NGN",
        defaultLocale: store.defaultLocale ?? "en-NG",
        isActive: store.isActive,
      });
    }

    if (mode === "create" && !store) {
      form.reset({
        name: "",
        slug: "",
        defaultCurrency: "NGN",
        defaultLocale: "en-NG",
        isActive: true,
      });
    }
  }, [store, mode, form]);

  const handleSubmit = async (values: StoreFormValues) => {
    await onSubmit(values);
  };

  return (
    <FormModal
      open={open}
      mode={mode}
      title={mode === "create" ? "Create Store" : "Edit Store"}
      onClose={onClose}
      onSubmit={form.handleSubmit(handleSubmit)}
      isSubmitting={form.formState.isSubmitting}
      submitLabel={mode === "create" ? "Create Store" : "Save Changes"}
    >
      <Form {...form}>
        <div className="space-y-4">
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Store Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="My Store"
                    {...field}
                    value={field.value ?? ""} // keep controlled
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Slug (auto, disabled) */}
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Slug</FormLabel>
                <FormControl>
                  <Input
                    placeholder="my-store"
                    {...field}
                    value={field.value ?? ""} // keep controlled
                    disabled
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  Used in your store URLs and must be unique within the company.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Currency */}
          <FormField
            control={form.control}
            name="defaultCurrency"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Default Currency</FormLabel>
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

          {/* Locale */}
          <FormField
            control={form.control}
            name="defaultLocale"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Default Locale</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select locale" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {defaultLocaleOptions.map((option) => (
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

          {/* Active toggle */}
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={!!field.value} // always boolean
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                </FormControl>
                <FormLabel className="font-normal">Store is active</FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>
    </FormModal>
  );
}
