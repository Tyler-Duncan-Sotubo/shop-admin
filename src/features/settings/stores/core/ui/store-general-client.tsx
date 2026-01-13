/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Loading from "@/shared/ui/loading";
import { EmptyState } from "@/shared/ui/empty-state";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { cn } from "@/lib/utils";

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

import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { ImageIcon, Trash2, UploadCloud } from "lucide-react";

import { useStores } from "../hooks/use-stores";
import type { Store } from "../types/store.type";
import { useUpdateMutation } from "@/shared/hooks/use-update-mutation";
import type { UpdateStorePayload } from "../types/store.type";

import { StoreSchema, StoreFormValues } from "../schema/stores.schema";
import {
  currencyOptions,
  defaultLocaleOptions,
} from "../../../account/config/general-settings.config";
import { slugify } from "@/shared/utils/slugify";
import { Checkbox } from "@/shared/ui/checkbox";

const currencyMeta = {
  GBP: { label: "GBP", symbol: "£", flag: "🇬🇧" },
  USD: { label: "USD", symbol: "$", flag: "🇺🇸" },
  CAD: { label: "CAD", symbol: "$", flag: "🇨🇦" },
} as const;

type SupportedCurrency = keyof typeof currencyMeta;

export default function StoreGeneralClient({ storeId }: { storeId: string }) {
  const { stores, isLoading, fetchError } = useStores();

  const store = useMemo<Store | null>(
    () => stores.find((s) => s.id === storeId) ?? null,
    [stores, storeId]
  );

  const updateStore = useUpdateMutation<UpdateStorePayload>({
    endpoint: store ? `/api/stores/${store.id}` : "/api/stores/__placeholder",
    successMessage: "Store updated successfully",
    refetchKey: "stores",
    method: "PATCH",
  });

  const form = useForm<StoreFormValues>({
    resolver: zodResolver(StoreSchema),
    defaultValues: {
      name: "",
      slug: "",
      defaultCurrency: "NGN",
      defaultLocale: "en-NG",
      isActive: true,
      base64Image: null,
      coverImageAltText: "",
      removeImage: false,
      supportedCurrencies: [],
    } as any,
    mode: "onChange",
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // watch name to (optionally) keep slug updated (only if you still store slug)
  const nameValue = useWatch({ control: form.control, name: "name" });

  // If you want slug locked for edit mode, keep it untouched.
  // If you want to auto-update slug ONLY when slug is empty, do this:
  useEffect(() => {
    const currentSlug = form.getValues("slug");
    if (!currentSlug) {
      const next = slugify(nameValue || "");
      if (next && next !== currentSlug) {
        form.setValue("slug", next, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
    }
  }, [nameValue, form]);

  // Populate form once store loads/changes
  useEffect(() => {
    if (!store) return;

    form.reset({
      name: store.name ?? "",
      slug: store.slug ?? "",
      defaultCurrency: store.defaultCurrency ?? "NGN",
      defaultLocale: store.defaultLocale ?? "en-NG",
      isActive: !!store.isActive,
      base64Image: null,
      coverImageAltText: (store as any).imageAltText ?? "",
      removeImage: false,
      supportedCurrencies: store.supportedCurrencies ?? [],
    } as any);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreviewImage((store as any).imageUrl ?? null);
    setSubmitError(null);
  }, [storeId, store, form]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;

        setPreviewImage(base64);
        form.setValue("base64Image" as any, base64 as any, {
          shouldDirty: true,
          shouldValidate: true,
        });

        form.setValue("removeImage" as any, false as any, {
          shouldDirty: true,
          shouldValidate: false,
        });
      };

      reader.readAsDataURL(file);
    },
    [form]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const clearImage = () => {
    setPreviewImage(null);

    form.setValue("base64Image" as any, null as any, {
      shouldDirty: true,
      shouldValidate: true,
    });

    // in edit page: clearing means remove existing stored image
    form.setValue("removeImage" as any, true as any, {
      shouldDirty: true,
      shouldValidate: false,
    });
  };

  if (isLoading && stores.length === 0) return <Loading />;

  if (fetchError && stores.length === 0) {
    return (
      <p className="text-sm text-destructive">
        Failed to load store: {fetchError}
      </p>
    );
  }

  if (!store) {
    return (
      <EmptyState
        title="Store not found"
        description="This store may have been removed or you may not have access."
      />
    );
  }

  const onSubmit = async (values: StoreFormValues) => {
    setSubmitError(null);

    await updateStore(
      {
        name: values.name,
        slug: values.slug,
        defaultCurrency: values.defaultCurrency,
        defaultLocale: values.defaultLocale,
        isActive: values.isActive,
        base64Image: values.base64Image,
        coverImageAltText: values.coverImageAltText,
        removeImage: values.removeImage,
      } as any,
      setSubmitError
    );
  };

  const onCancel = () => {
    if (!store) return;

    form.reset({
      name: store.name ?? "",
      slug: store.slug ?? "",
      defaultCurrency: store.defaultCurrency ?? "NGN",
      defaultLocale: store.defaultLocale ?? "en-NG",
      isActive: !!store.isActive,
      base64Image: null,
      coverImageAltText: (store as any).imageAltText ?? "",
      removeImage: false,
    } as any);

    setPreviewImage((store as any).imageUrl ?? null);
    setSubmitError(null);
  };

  const isDirty = form.formState.isDirty;
  const saving = form.formState.isSubmitting;

  return (
    <section className="space-y-8 max-w-3xl">
      {/* Cover / Logo */}

      <Form {...form}>
        <div className="space-y-4 ">
          <div className="space-y-3 w-[50%]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Store image</div>
                <div className="text-sm text-muted-foreground">
                  Upload a logo or cover image for this store.
                </div>
              </div>

              {previewImage ? (
                <button
                  type="button"
                  onClick={clearImage}
                  className="inline-flex items-center gap-2 text-xs text-destructive hover:underline"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              ) : null}
            </div>

            <div
              {...getRootProps()}
              className={cn(
                "border rounded-lg w-full flex flex-col items-center justify-center p-6",
                "border-dashed cursor-pointer hover:border-primary",
                isDragActive && "border-primary"
              )}
            >
              <input {...getInputProps()} />

              {previewImage ? (
                <Image
                  src={previewImage}
                  alt="Store image"
                  className="rounded-lg object-cover"
                  width={120}
                  height={90}
                />
              ) : (
                <div className="flex h-16 w-full items-center justify-center rounded-lg bg-muted/30">
                  <ImageIcon className="h-10 w-10 text-muted-foreground" />
                </div>
              )}

              <div className="mt-4 text-center text-sm text-muted-foreground">
                {isDragActive ? (
                  <p className="text-primary">Drop the file here…</p>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <UploadCloud className="h-5 w-5" />
                    <p>Drag & drop or click to upload</p>
                  </div>
                )}
              </div>
            </div>

            {/* keep these in the form */}
            <FormField
              control={form.control}
              name={"base64Image" as any}
              render={() => (
                <FormItem>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={"removeImage" as any}
              render={() => (
                <FormItem>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Store name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="My Store"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
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
                <FormLabel required>Default currency</FormLabel>
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
                <FormLabel required>Default locale</FormLabel>
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

          <FormField
            control={form.control}
            name={"supportedCurrencies" as any}
            render={({ field }) => {
              const options: SupportedCurrency[] = ["GBP", "USD", "CAD"];

              const current: SupportedCurrency[] = Array.isArray(field.value)
                ? field.value
                : [];

              const toggle = (code: SupportedCurrency, checked: boolean) => {
                const next = checked
                  ? Array.from(new Set([...current, code]))
                  : current.filter((x) => x !== code);
                field.onChange(next);
              };

              return (
                <FormItem className="space-y-2 mt-5">
                  <div>
                    <FormLabel>Additional currencies</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Optional. Select extra currencies to support (display or
                      future payments).
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {options.map((code) => {
                      const meta = currencyMeta[code];
                      const checked = current.includes(code);

                      return (
                        <label
                          key={code}
                          className={cn(
                            "group flex items-center justify-between rounded-xl border px-3 py-2 text-sm cursor-pointer select-none",
                            "transition-colors hover:bg-muted/40",
                            checked
                              ? "border-primary ring-1 ring-primary/30"
                              : ""
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-8 w-8 items-center justify-center text-lg"
                              aria-hidden="true"
                            >
                              {meta.flag}
                            </div>

                            <div className="leading-tight">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {meta.label}
                                </span>
                                <span className="text-muted-foreground">
                                  {meta.symbol}
                                </span>
                              </div>
                            </div>
                          </div>

                          <Checkbox
                            checked={checked}
                            onCheckedChange={(v) => toggle(code, !!v)}
                            aria-label={`Toggle ${meta.label}`}
                          />
                        </label>
                      );
                    })}
                  </div>

                  <FormMessage />
                </FormItem>
              );
            }}
          />

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
                <FormLabel className="font-normal">Store is active</FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center gap-2 mt-10">
            <Button
              type="button"
              variant="clean"
              onClick={onCancel}
              disabled={!isDirty || saving}
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={form.handleSubmit(onSubmit)}
              disabled={!isDirty || saving}
              isLoading={saving}
            >
              Save changes
            </Button>
          </div>
        </div>
      </Form>

      {submitError ? (
        <p className="text-sm text-destructive">{submitError}</p>
      ) : null}
    </section>
  );
}
