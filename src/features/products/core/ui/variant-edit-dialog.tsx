/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { ProductVariant } from "../api/product-variants.api";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { UploadCloud, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { VariantFormValues, VariantSchema } from "../schema/variant.schema";
import {
  numToStr,
  toStrOrEmpty,
  toStrOrZero,
} from "@/shared/utils/number-to-string";
import { useProductVariants } from "../hooks/use-product-variants"; // ✅ adjust path

function nairaPrefixProps() {
  return {
    inputMode: "decimal" as const,
    placeholder: "0",
  };
}

export function VariantEditDialog({
  open,
  variant,
  productId,
  onClose,
}: {
  open: boolean;
  variant: ProductVariant | null;
  productId: string; // ✅ needed to target correct queryKey
  onClose: () => void;
}) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  // image upload state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageVersion, setImageVersion] = useState<number>(() => Date.now());

  // ✅ use the hook mutation so invalidation matches the query key
  const { updateVariant } = useProductVariants(productId);

  const form = useForm<VariantFormValues>({
    resolver: zodResolver(VariantSchema),
    defaultValues: {
      title: "",
      sku: "",
      barcode: "",
      base64Image: "",
      regularPrice: "0",
      salePrice: "",
      weight: "",
      length: "",
      width: "",
      height: "",
      stockQuantity: "",
      lowStockThreshold: "",
    },
    mode: "onChange",
  });

  // ---- Dropzone (base64 upload) ----
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setUploadedImage(base64);

        form.setValue("base64Image", base64, {
          shouldDirty: true,
          shouldValidate: true,
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

  const withVersion = (url?: string) => {
    if (!url) return "";
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}v=${imageVersion}`;
  };

  useEffect(() => {
    if (!variant) return;

    const anyVar: any = variant;

    form.reset({
      title: toStrOrEmpty(variant.title),
      sku: toStrOrEmpty(variant.sku),
      barcode: toStrOrEmpty(variant.barcode),
      base64Image: "",
      regularPrice: toStrOrZero((variant as any).regularPrice),
      salePrice: toStrOrEmpty((variant as any).salePrice),
      weight: toStrOrEmpty(anyVar?.weight),
      length: toStrOrEmpty(anyVar?.length),
      width: toStrOrEmpty(anyVar?.width),
      height: toStrOrEmpty(anyVar?.height),
      stockQuantity: numToStr(anyVar?.inventory?.stockQuantity),
      lowStockThreshold: numToStr(anyVar?.inventory?.lowStockThreshold),
    });

    setUploadedImage(null);
  }, [variant, open]); // eslint-disable-line react-hooks/exhaustive-deps

  const savedImageUrl = (variant as any)?.image?.url;
  const imageSrc =
    uploadedImage || (savedImageUrl ? withVersion(savedImageUrl) : "");

  const submit = async (values: VariantFormValues) => {
    if (!variant) return;
    setSubmitError(null);

    const payload: any = {
      title: values.title ?? null,
      sku: values.sku?.trim() ? values.sku.trim() : null,
      barcode: values.barcode?.trim() ? values.barcode.trim() : null,

      regularPrice: values.regularPrice,
      salePrice: values.salePrice?.trim() ? values.salePrice.trim() : null,

      weight: values.weight?.trim() ? values.weight.trim() : null,
      length: values.length?.trim() ? values.length.trim() : null,
      width: values.width?.trim() ? values.width.trim() : null,
      height: values.height?.trim() ? values.height.trim() : null,

      stockQuantity: values.stockQuantity?.trim() || null,
      safetyStock: values.lowStockThreshold?.trim() || null,

      base64Image: values.base64Image?.trim()
        ? values.base64Image.trim()
        : undefined,
    };

    try {
      await updateVariant.mutateAsync({
        variantId: variant.id,
        payload,
      });

      setImageVersion(() => Date.now());
      onClose();
    } catch (e: any) {
      setSubmitError(e?.message ?? "Failed to update variant");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? onClose() : null)}>
      <DialogContent className="sm:max-w-[920px]">
        <DialogHeader>
          <DialogTitle>Edit variant</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* LEFT: Image uploader */}
              <div className="md:col-span-1">
                <div
                  {...getRootProps()}
                  className={cn(
                    "border rounded-lg w-full flex flex-col items-center justify-center p-6",
                    "border-dashed cursor-pointer hover:border-primary"
                  )}
                >
                  <input {...getInputProps()} />

                  {imageSrc ? (
                    <Image
                      src={imageSrc}
                      alt="Variant image"
                      className="rounded-lg object-cover"
                      width={220}
                      height={220}
                    />
                  ) : (
                    <div className="flex h-40 w-full items-center justify-center rounded-lg bg-muted/30">
                      <UserIcon className="h-10 w-10 text-muted-foreground" />
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

                <FormField
                  control={form.control}
                  name="base64Image"
                  render={() => (
                    <FormItem className="mt-2">
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* RIGHT: form */}
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Optional"
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            disabled
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU</FormLabel>
                        <FormControl>
                          <Input
                            value={field.value ?? ""}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="barcode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Barcode</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Optional"
                            value={field.value ?? ""}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* PRICING */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="regularPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>₦ Regular price</FormLabel>
                        <FormControl>
                          <Input
                            {...nairaPrefixProps()}
                            value={field.value ?? ""}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="salePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>₦ Sale price</FormLabel>
                        <FormControl>
                          <Input
                            {...nairaPrefixProps()}
                            placeholder="Optional"
                            value={field.value ?? ""}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* INVENTORY */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="stockQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock quantity</FormLabel>
                        <FormControl>
                          <Input
                            inputMode="numeric"
                            placeholder="0"
                            value={field.value ?? ""}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lowStockThreshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Low stock threshold</FormLabel>
                        <FormControl>
                          <Input
                            inputMode="numeric"
                            placeholder="e.g. 5"
                            value={field.value ?? ""}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* DIMENSIONS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight</FormLabel>
                        <FormControl>
                          <Input
                            inputMode="decimal"
                            value={field.value ?? ""}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="length"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Length</FormLabel>
                        <FormControl>
                          <Input
                            inputMode="decimal"
                            value={field.value ?? ""}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="width"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Width</FormLabel>
                        <FormControl>
                          <Input
                            inputMode="decimal"
                            value={field.value ?? ""}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height</FormLabel>
                        <FormControl>
                          <Input
                            inputMode="decimal"
                            value={field.value ?? ""}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {submitError ? (
              <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                {submitError}
              </div>
            ) : null}

            <DialogFooter>
              <Button type="button" variant="clean" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  form.formState.isSubmitting || updateVariant.isPending
                }
              >
                {form.formState.isSubmitting || updateVariant.isPending
                  ? "Saving..."
                  : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
