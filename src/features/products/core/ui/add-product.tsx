/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Button } from "@/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { CreateProductSchema } from "../schema/create-product.schema";
import { CreateProductPayload } from "../types/product.type";
import { useCreateProduct } from "../hooks/use-product";
import { SectionHeading } from "@/shared/ui/section-heading";
import Image from "next/image";
import { CategoryCheckboxPicker } from "@/features/products/categories/ui/category-checkbox-picker";
import { useCategories } from "@/features/products/categories/hooks/use-categories";
import { ProductUpsellCrossSellLinks } from "./product-upsell-cross-sell-link";
import PageHeader from "@/shared/ui/page-header";
import { useDropzone } from "react-dropzone";
import { UploadCloud, UserIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import { TiptapEditor } from "@/shared/ui/tiptap-editor";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { BackButton } from "@/shared/ui/back-button";
import {
  PresignedUpload,
  sanitizeFileName,
  uploadToS3Put,
} from "@/lib/s3-upload";

type AddProductPageProps = {
  afterCreatePath?: (productId: string) => string;
};

type LocalImage = {
  file: File;
  previewUrl: string; // object URL for preview
};

const MAX_SIMPLE_IMAGES = 9;
const MAX_VARIABLE_IMAGES = 3;

export function AddProduct({ afterCreatePath }: AddProductPageProps) {
  const { activeStoreId } = useStoreScope();
  const { data: session } = useSession();
  const axios = useAxiosAuth();
  const router = useRouter();
  const { createProduct } = useCreateProduct();
  const { createCategory } = useCategories(session, axios, activeStoreId);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [localImages, setLocalImages] = useState<LocalImage[]>([]);

  const form = useForm({
    resolver: zodResolver(CreateProductSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "draft",
      productType: "variable",
      sku: "",
      barcode: "",
      regularPrice: "0",
      salePrice: "",
      stockQuantity: "",
      lowStockThreshold: "",
      weight: "",
      length: "",
      width: "",
      height: "",
      categoryIds: [],
      links: { related: [], upsell: [], cross_sell: [] },
      seoTitle: "",
      seoDescription: "",
      howItFeelsAndLooks: "",
      whyYouWillLoveIt: "",
      details: "",
      images: [], // will contain keys on submit (not base64)
      defaultImageIndex: 0,
      moq: "1",
    },
    mode: "onSubmit",
  });

  const productType =
    useWatch({ control: form.control, name: "productType" }) ?? "variable";

  const maxImages = useMemo(
    () =>
      productType === "variable" ? MAX_VARIABLE_IMAGES : MAX_SIMPLE_IMAGES,
    [productType],
  );

  // cleanup object URLs
  useEffect(() => {
    return () => {
      localImages.forEach((i) => URL.revokeObjectURL(i.previewUrl));
    };
  }, [localImages]);

  // enforce limit when productType changes
  useEffect(() => {
    if (localImages.length > maxImages) {
      const trimmed = localImages.slice(0, maxImages);
      localImages
        .slice(maxImages)
        .forEach((i) => URL.revokeObjectURL(i.previewUrl));
      setLocalImages(trimmed);
      form.setValue("defaultImageIndex", 0, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
    if (maxImages === 3) {
      form.setValue("defaultImageIndex", 0, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [maxImages, localImages, form]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles?.length) return;

      const remaining = maxImages - localImages.length;
      if (remaining <= 0) return;

      const nextFiles = acceptedFiles.slice(0, remaining);
      const newOnes = nextFiles.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      }));

      setLocalImages((prev) => [...prev, ...newOnes].slice(0, maxImages));
    },
    [localImages.length, maxImages],
  );

  const removeImage = useCallback(
    (index: number) => {
      setLocalImages((prev) => {
        const next = prev.filter((_, i) => i !== index);
        const removed = prev[index];
        if (removed) URL.revokeObjectURL(removed.previewUrl);
        form.setValue("defaultImageIndex", 0, {
          shouldDirty: true,
          shouldValidate: true,
        });
        return next;
      });
    },
    [form],
  );

  const setDefaultImageIndex = useCallback(
    (index: number) => {
      form.setValue("defaultImageIndex", maxImages === 3 ? 0 : index, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [form, maxImages],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: maxImages > 1,
    maxFiles: maxImages,
  });

  async function presignUploads(files: File[]) {
    const payload = {
      count: files.length,
      files: files.map((f) => ({
        fileName: sanitizeFileName(f.name || `upload-${Date.now()}`),
        mimeType: f.type || "image/jpeg",
      })),
      storeId: activeStoreId,
      // optionally pass companyId/productId if your API needs it
    };

    const res = await fetch("/api/uploads/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Failed to create upload URLs");
    const data = (await res.json()) as { uploads: PresignedUpload[] };
    return data.uploads;
  }

  const buildPayload = (
    values: any,
    imagesDto?: any[],
  ): CreateProductPayload => {
    const md: Record<string, any> = {
      how_it_feels_and_looks: values.howItFeelsAndLooks ?? "",
      why_you_will_love_it: values.whyYouWillLoveIt ?? "",
      details: values.details ?? "",
    };

    Object.keys(md).forEach((k) => {
      if (typeof md[k] === "string" && md[k].trim() === "") delete md[k];
    });
    const isSimple = (values.productType ?? "variable") === "simple";
    return {
      storeId: activeStoreId,
      name: values.name,
      description: values.description ?? null,
      status: values.status ?? "draft",
      productType: values.productType as any,
      seoTitle: values.seoTitle ?? null,
      seoDescription: values.seoDescription ?? null,
      categoryIds: values.categoryIds ?? [],
      links: values.links ?? { related: [], upsell: [], cross_sell: [] },
      metadata: md,
      images: imagesDto?.length ? imagesDto : undefined,
      defaultImageIndex:
        (values.productType ?? "variable") === "variable"
          ? 0
          : typeof values.defaultImageIndex === "number"
            ? values.defaultImageIndex
            : 0,

      ...(isSimple
        ? {
            sku: values.sku?.trim() ? values.sku.trim() : null,
            barcode: values.barcode?.trim() ? values.barcode.trim() : null,

            regularPrice: values.regularPrice ?? "0",
            salePrice: values.salePrice?.trim()
              ? values.salePrice.trim()
              : null,

            stockQuantity: values.stockQuantity?.trim() || null,
            lowStockThreshold: values.lowStockThreshold?.trim() || null,

            weight: values.weight?.trim() || null,
            length: values.length?.trim() || null,
            width: values.width?.trim() || null,
            height: values.height?.trim() || null,
          }
        : {}),
    };
  };

  const onSubmit: SubmitHandler<any> = async (values) => {
    setSubmitError(null);

    try {
      setIsSubmitting(true);

      // 1) upload images (if any) to S3
      let imagesDto: any[] | undefined = undefined;

      if (localImages.length) {
        const files = localImages.map((i) => i.file);
        const uploads = await presignUploads(files);

        if (uploads.length !== files.length) {
          throw new Error("Upload URLs mismatch");
        }

        await Promise.all(
          uploads.map((u, idx) => uploadToS3Put(u.uploadUrl, files[idx])),
        );

        const productName = values.name || "Product image";

        imagesDto = uploads.map((u, idx) => ({
          key: u.key,
          url: u.url,
          fileName: sanitizeFileName(files[idx].name || `img-${idx}.jpg`),
          mimeType: files[idx].type || "image/jpeg",
          altText: productName,
          position: idx,
        }));
      }

      // 2) create product with keys/urls
      const payload = buildPayload(values, imagesDto);

      const created = await createProduct(
        payload,
        (msg) => setSubmitError(msg),
        form.reset,
      );

      const productId = created?.id ?? created?.data?.id;

      if (productId) {
        const isSimple = (values.productType ?? "variable") === "simple";
        const next = afterCreatePath
          ? afterCreatePath(productId)
          : isSimple
            ? `/products`
            : `/products/${productId}/variants`;

        router.push(next);
        return;
      }

      router.push(`/products`);
    } catch (error: any) {
      setSubmitError(error?.message ?? "Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentDefault =
    useWatch({ control: form.control, name: "defaultImageIndex" }) ?? 0;

  return (
    <div className="space-y-6">
      <BackButton href="/products?tab=products" label="Back to products" />

      <PageHeader
        title="Add product"
        description="Create the product shell first. You’ll set options/variants in step 2."
      >
        <Button
          type="submit"
          form="add-product-form"
          disabled={isSubmitting}
          isLoading={isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Create & continue"}
        </Button>
      </PageHeader>

      <Form {...form}>
        <form
          id="add-product-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN */}
            <div className="lg:col-span-8 space-y-6">
              {/* Basics */}
              <div className="rounded-lg border p-4 space-y-4">
                <SectionHeading>Basic information</SectionHeading>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Classic T-Shirt" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <TiptapEditor
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          placeholder="Write your post…"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="lg:hidden space-y-6">
                <div className="rounded-lg border p-4 w-full flex flex-row gap-3 text-sm">
                  <div className="flex-1 min-w-0 space-y-2">
                    <p>Product status</p>
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormControl>
                            <Select
                              value={field.value ?? undefined}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="active">Publish</SelectItem>
                                <SelectItem value="archived">
                                  Archive
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <p>Product type</p>
                    <FormField
                      control={form.control}
                      name="productType"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="variable">
                                  Variable
                                </SelectItem>
                                <SelectItem value="simple">Simple</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div>
                  <FormField
                    control={form.control}
                    name="moq"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>MOQ</FormLabel>
                        <FormControl>
                          <Input
                            inputMode="numeric"
                            placeholder="1"
                            value={field.value ?? ""}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Images */}
                <div className="rounded-lg border p-4 space-y-4">
                  <SectionHeading>{`Images (optional, up to ${maxImages})`}</SectionHeading>

                  <div
                    {...getRootProps()}
                    className={cn(
                      "border rounded-lg w-full flex flex-col items-center justify-center p-6",
                      "border-dashed cursor-pointer hover:border-primary",
                    )}
                  >
                    <input {...getInputProps()} />

                    {localImages.length ? (
                      <div className="grid grid-cols-3 gap-2 w-full">
                        {localImages.map((img, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              "relative rounded-lg overflow-hidden border",
                              idx === currentDefault
                                ? "ring-2 ring-primary"
                                : "",
                            )}
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage(idx);
                              }}
                              className="absolute top-1 right-1 z-10 rounded-full bg-background/80 p-1 hover:bg-background"
                              aria-label="Remove image"
                            >
                              <X className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDefaultImageIndex(idx);
                              }}
                              className="absolute bottom-1 left-1 z-10 rounded-md bg-background/80 px-2 py-1 text-xs hover:bg-background"
                            >
                              {idx === currentDefault
                                ? "Default"
                                : "Set default"}
                            </button>

                            <Image
                              src={img.previewUrl}
                              alt="Product image"
                              className="h-24 w-full object-cover"
                              width={220}
                              height={220}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex h-40 w-full items-center justify-center rounded-lg bg-muted/30">
                        <UserIcon className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )}

                    <div className="mt-4 text-center text-sm text-muted-foreground">
                      {isDragActive ? (
                        <p className="text-primary">Drop the files here…</p>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <UploadCloud className="h-5 w-5" />
                          <p>
                            Drag & drop or click to upload{" "}
                            {localImages.length
                              ? `(you can add ${maxImages - localImages.length} more)`
                              : `(up to ${maxImages})`}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="images"
                    render={() => (
                      <FormItem>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="defaultImageIndex"
                    render={() => (
                      <FormItem>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Categories */}
                <div className="rounded-lg border p-4 space-y-2">
                  <SectionHeading>Categories</SectionHeading>
                  <CategoryCheckboxPicker
                    name="categoryIds"
                    onCreateCategory={async (payload, setError) => {
                      return createCategory(payload, setError);
                    }}
                  />
                </div>
              </div>

              {productType === "simple" ? (
                <div className="rounded-lg border p-4 space-y-4">
                  <SectionHeading>Simple product details</SectionHeading>

                  <div className="grid grid-cols-2 gap-3">
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

                  {/* Pricing */}
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="regularPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Regular price</FormLabel>
                          <FormControl>
                            <Input
                              inputMode="decimal"
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
                      name="salePrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sale price</FormLabel>
                          <FormControl>
                            <Input
                              inputMode="decimal"
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

                  {/* Inventory */}
                  <div className="grid grid-cols-3 gap-3">
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
                          <FormLabel>
                            <div>
                              <p className="md:hidden">Low stock</p>
                              <p className="hidden md:block">
                                Low stock threshold
                              </p>
                            </div>
                          </FormLabel>
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

                    <FormField
                      control={form.control}
                      name="moq"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>MOQ</FormLabel>
                          <FormControl>
                            <Input
                              inputMode="numeric"
                              placeholder="1"
                              value={field.value ?? ""}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Dimensions */}
                  <div className="grid grid-cols-2 gap-3">
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
              ) : null}

              {/* Product details */}
              <div className="rounded-lg border p-4 space-y-4">
                <SectionHeading>Product details</SectionHeading>

                <FormField
                  control={form.control}
                  name="howItFeelsAndLooks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How it feels and looks</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Write how the product feels, looks, fit, texture..."
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                          className="h-48 resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="whyYouWillLoveIt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Why you will love it</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Key benefits, reasons to buy, unique selling points..."
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                          className="h-48 resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="details"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Details</FormLabel>
                      <FormControl>
                        <TiptapEditor
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          placeholder="Write your post…"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* SEO */}
              <div className="rounded-lg border p-4 space-y-4">
                <SectionHeading>SEO</SectionHeading>

                <FormField
                  control={form.control}
                  name="seoTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SEO title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Optional"
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="seoDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SEO description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Optional"
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                          className="h-24 resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {submitError ? (
                  <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                    {submitError}
                  </div>
                ) : null}
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:col-span-4 space-y-6">
              <div className="hidden lg:block space-y-6">
                <div className="rounded-lg border p-4 space-y-4">
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Select
                              value={field.value ?? undefined}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger className="w-64">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="active">Publish</SelectItem>
                                <SelectItem value="archived">
                                  Archive
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                {/* Product type */}
                <div className="rounded-lg border p-4 space-y-4">
                  <SectionHeading>Product type</SectionHeading>

                  <FormField
                    control={form.control}
                    name="productType"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="w-64">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="variable">Variable</SelectItem>
                              <SelectItem value="simple">Simple</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <FormField
                    control={form.control}
                    name="moq"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>MOQ</FormLabel>
                        <FormControl>
                          <Input
                            inputMode="numeric"
                            placeholder="1"
                            value={field.value ?? ""}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Images */}
                <div className="rounded-lg border p-4 space-y-4">
                  <SectionHeading>{`Images (optional, up to ${maxImages})`}</SectionHeading>

                  <div
                    {...getRootProps()}
                    className={cn(
                      "border rounded-lg w-full flex flex-col items-center justify-center p-6",
                      "border-dashed cursor-pointer hover:border-primary",
                    )}
                  >
                    <input {...getInputProps()} />

                    {localImages.length ? (
                      <div className="grid grid-cols-3 gap-2 w-full">
                        {localImages.map((img, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              "relative rounded-lg overflow-hidden border",
                              idx === currentDefault
                                ? "ring-2 ring-primary"
                                : "",
                            )}
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage(idx);
                              }}
                              className="absolute top-1 right-1 z-10 rounded-full bg-background/80 p-1 hover:bg-background"
                              aria-label="Remove image"
                            >
                              <X className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDefaultImageIndex(idx);
                              }}
                              className="absolute bottom-1 left-1 z-10 rounded-md bg-background/80 px-2 py-1 text-xs hover:bg-background"
                            >
                              {idx === currentDefault
                                ? "Default"
                                : "Set default"}
                            </button>

                            <Image
                              src={img.previewUrl}
                              alt="Product image"
                              className="h-24 w-full object-cover"
                              width={220}
                              height={220}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex h-40 w-full items-center justify-center rounded-lg bg-muted/30">
                        <UserIcon className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )}

                    <div className="mt-4 text-center text-sm text-muted-foreground">
                      {isDragActive ? (
                        <p className="text-primary">Drop the files here…</p>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <UploadCloud className="h-5 w-5" />
                          <p>
                            Drag & drop or click to upload{" "}
                            {localImages.length
                              ? `(you can add ${maxImages - localImages.length} more)`
                              : `(up to ${maxImages})`}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="images"
                    render={() => (
                      <FormItem>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="defaultImageIndex"
                    render={() => (
                      <FormItem>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Categories */}
                <div className="rounded-lg border p-4 space-y-2">
                  <SectionHeading>Categories</SectionHeading>
                  <CategoryCheckboxPicker
                    name="categoryIds"
                    onCreateCategory={async (payload, setError) => {
                      return createCategory(payload, setError);
                    }}
                  />
                </div>
              </div>

              {/* Linked Products */}
              <div className="rounded-lg border p-4 space-y-2">
                <SectionHeading>Linked products</SectionHeading>
                <ProductUpsellCrossSellLinks />
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
