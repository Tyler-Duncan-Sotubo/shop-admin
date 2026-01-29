/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import { useProductVariants } from "../hooks/use-product-variants";
import { useStoreScope } from "@/lib/providers/store-scope-provider";

type PresignReq = { files: { fileName: string; mimeType: string }[] };
type PresignedUpload = { key: string; uploadUrl: string; url: string };

function nairaPrefixProps() {
  return {
    inputMode: "decimal" as const,
    placeholder: "0",
  };
}

function sanitizeFileName(name: string) {
  return (name || "upload")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .slice(0, 120);
}

async function presignVariantImage(file: File) {
  const body: PresignReq = {
    files: [
      {
        fileName: sanitizeFileName(file.name || `upload-${Date.now()}.jpg`),
        mimeType: file.type || "image/jpeg",
      },
    ],
  };

  const res = await fetch("/api/uploads/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || "Failed to presign upload");
  }

  const data = (await res.json()) as { uploads: PresignedUpload[] };
  const first = data.uploads?.[0];
  if (!first) throw new Error("No presigned upload returned");
  return first;
}

async function putToS3(uploadUrl: string, file: File) {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type || "application/octet-stream" },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`S3 upload failed (${res.status}) ${text}`);
  }
}

export function VariantEditDialog({
  open,
  variant,
  productId,
  onClose,
}: {
  open: boolean;
  variant: ProductVariant | null;
  productId: string;
  onClose: () => void;
}) {
  const { activeStoreId } = useStoreScope();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [imageVersion, setImageVersion] = useState<number>(() => Date.now());
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const [imageKey, setImageKey] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");

  const [imageFileName, setImageFileName] = useState<string>("");
  const [imageMimeType, setImageMimeType] = useState<string>("image/jpeg");

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

  const withVersion = (url?: string) => {
    if (!url) return "";
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}v=${imageVersion}`;
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setSubmitError(null);

      setImageMimeType(file.type || "image/jpeg");
      setImageFileName(file.name || `upload-${Date.now()}.jpg`);

      const objectUrl = URL.createObjectURL(file);
      setLocalPreview(objectUrl);

      setPendingFile(file);

      setImageKey("");
      setImageUrl("");

      form.setValue("base64Image", "", {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [form],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

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

    setSubmitError(null);
    setPendingFile(null);

    setLocalPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });

    setImageKey("");
    setImageUrl("");
    setImageFileName("");
    setImageMimeType("image/jpeg");
  }, [variant, open]);

  const savedImageUrl = (variant as any)?.image?.url;

  const imageSrc = useMemo(() => {
    if (localPreview) return localPreview;
    if (savedImageUrl) return withVersion(savedImageUrl);
    return "";
  }, [localPreview, savedImageUrl, imageVersion]);

  const submit = async (values: VariantFormValues) => {
    if (!variant) return;
    setSubmitError(null);

    const removeSalePrice = !values.salePrice?.trim();

    let nextKey = imageKey;
    let nextUrl = imageUrl;

    try {
      if (pendingFile) {
        const presigned = await presignVariantImage(pendingFile);
        await putToS3(presigned.uploadUrl, pendingFile);

        nextKey = presigned.key;
        nextUrl = presigned.url;

        setImageKey(nextKey);
        setImageUrl(nextUrl);
      }

      const payload: any = {
        storeId: activeStoreId,
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
        removeSalePrice: removeSalePrice,

        ...(pendingFile
          ? {
              imageKey: nextKey,
              imageUrl: nextUrl,
              imageAltText: values.title || null,
              imageFileName: imageFileName?.trim() || null,
              imageMimeType: imageMimeType || "image/jpeg",
            }
          : {}),
      };

      await updateVariant.mutateAsync({
        variantId: variant.id,
        payload,
      });

      setImageVersion(() => Date.now());

      setLocalPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });

      setPendingFile(null);
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
              {/* LEFT: Image uploader (compact on mobile) */}
              <div className="md:col-span-1">
                <div
                  {...getRootProps()}
                  className={cn(
                    "border rounded-lg w-full flex flex-col items-center justify-center",
                    "border-dashed cursor-pointer hover:border-primary",
                    // compact spacing
                    "p-3 md:p-4",
                  )}
                >
                  <input {...getInputProps()} />

                  {imageSrc ? (
                    <Image
                      src={imageSrc}
                      alt="Variant image"
                      className="rounded-md object-cover"
                      width={120} // 👈 reduced
                      height={120} // 👈 reduced
                    />
                  ) : (
                    <div className="flex h-28 w-full items-center justify-center rounded-md bg-muted/30 md:h-40">
                      <UserIcon className="h-8 w-8 text-muted-foreground md:h-10 md:w-10" />
                    </div>
                  )}

                  <div className="mt-2 text-center text-xs text-muted-foreground md:mt-4 md:text-sm">
                    {isDragActive ? (
                      <p className="text-primary">Drop the file here…</p>
                    ) : (
                      <div className="flex flex-col items-center gap-1 md:gap-2">
                        <UploadCloud className="h-4 w-4 md:h-5 md:w-5" />
                        <p>Tap or drag to upload</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* keep field for schema compatibility */}
                <FormField
                  control={form.control}
                  name="base64Image"
                  render={() => (
                    <FormItem className="mt-1">
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {pendingFile ? (
                  <div className="mt-1 text-[11px] text-muted-foreground space-y-0.5">
                    <div>
                      <span className="font-medium">File:</span>{" "}
                      {imageFileName || "—"}
                    </div>
                    <div>
                      <span className="font-medium">Type:</span>{" "}
                      {imageMimeType || "—"}
                    </div>
                  </div>
                ) : null}
              </div>

              {/* RIGHT: form */}
              <div className="md:col-span-2 space-y-4">
                {/* Title + SKU + Barcode (2-col on mobile) */}
                <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="col-span-2 md:col-span-2">
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
                      <FormItem className="col-span-1">
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
                      <FormItem className="col-span-1">
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

                {/* PRICING (2-col on mobile) */}
                <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
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

                {/* INVENTORY (2-col on mobile) */}
                <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
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

                {/* DIMENSIONS: 3-col on mobile, 2-col on desktop */}
                <div className="grid grid-cols-4 md:grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem className="col-span-1">
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
                      <FormItem className="col-span-1">
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
                      <FormItem className="col-span-1">
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

                  {/* Height: on mobile, take full row (optional). Remove col-span-3 if you want it 3-wide too */}
                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem className="md:col-span-1">
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

            <DialogFooter className="grid grid-cols-2">
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
