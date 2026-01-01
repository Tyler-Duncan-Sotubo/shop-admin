/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useState } from "react";
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

import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { UploadCloud, ImageIcon, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

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

      // ✅ image fields
      base64Image: null,
      coverImageAltText: "",
      removeImage: false,
    } as any,
    mode: "onChange",
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);

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
        // ✅ reset image fields
        base64Image: null,
        coverImageAltText: (store as any).imageAltText ?? "",
        removeImage: false,
      } as any);

      // ✅ preview existing store image (url)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreviewImage((store as any).imageUrl ?? null);
    }

    if (mode === "create" && !store) {
      form.reset({
        name: "",
        slug: "",
        defaultCurrency: "NGN",
        defaultLocale: "en-NG",
        isActive: true,

        base64Image: null,
        coverImageAltText: "",
        removeImage: false,
      } as any);

      setPreviewImage(null);
    }
  }, [store, mode, form]);

  // ✅ dropzone for cover image
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;

        // UI preview uses base64
        setPreviewImage(base64);

        // push to form so backend can upload to S3
        form.setValue("base64Image" as any, base64 as any, {
          shouldDirty: true,
          shouldValidate: true,
        });

        // if user had chosen "remove image", undo it
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

    // only set removeImage in edit mode (so backend deletes/unsets url)
    if (mode === "edit") {
      form.setValue("removeImage" as any, true as any, {
        shouldDirty: true,
        shouldValidate: false,
      });
    }
  };

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
          {/* ✅ Store Cover Image */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Store cover image</div>
                <div className="text-xs text-muted-foreground">
                  Upload a logo/cover image for the store.
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
                  alt="Store cover"
                  className="rounded-lg object-cover"
                  width={100}
                  height={80}
                />
              ) : (
                <div className="flex h-10 w-full items-center justify-center rounded-lg bg-muted/30">
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

            {/* keep base64Image + removeImage in the form */}
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
                <FormLabel required>Store Name</FormLabel>
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

          {/* Slug (auto, disabled)
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
                    value={field.value ?? ""}
                    disabled
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  Used in your store URLs and must be unique within the company.
                </p>
                <FormMessage />
              </FormItem>
            )}
          /> */}

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
                    checked={!!field.value}
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
