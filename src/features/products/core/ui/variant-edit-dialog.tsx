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

// ✅ S3 presign + upload helpers (adjust path if you placed elsewhere)
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

  // ✅ local preview + metadata for new upload
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
      // ✅ keep in schema if it exists, but we won't use it for upload
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

  // ---- Dropzone (NOW uploads to S3 via presign) ----
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setSubmitError(null);

      // capture metadata
      setImageMimeType(file.type || "image/jpeg");
      setImageFileName(file.name || `upload-${Date.now()}.jpg`);

      // local preview (fast)
      const objectUrl = URL.createObjectURL(file);
      setLocalPreview(objectUrl);

      // store pending file for submit
      setPendingFile(file);

      // reset keys until submit does the actual upload
      setImageKey("");
      setImageUrl("");

      // keep form field clean (we're not using base64 anymore)
      form.setValue("base64Image", "", {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [form]
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

    // reset local
    setSubmitError(null);
    setPendingFile(null);

    // release old object url
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

    // ✅ if a new file is selected, upload it now (presign -> PUT)
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

        // ✅ NEW: send key/url only if user uploaded a new image in this session
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

      // cleanup local preview url
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

                {/* keep field for schema compatibility */}
                <FormField
                  control={form.control}
                  name="base64Image"
                  render={() => (
                    <FormItem className="mt-2">
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {pendingFile ? (
                  <div className="mt-2 text-xs text-muted-foreground space-y-1">
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
