/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { SubmitHandler, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
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
import { STATUS_LABEL, type CreateProductPayload } from "../types/product.type";
import { SectionHeading } from "@/shared/ui/section-heading";
import { useSession } from "next-auth/react";
import { CategoryCheckboxPicker } from "@/features/products/categories/ui/category-checkbox-picker";
import { ProductUpsellCrossSellLinks } from "./product-upsell-cross-sell-link";
import Loading from "@/shared/ui/loading";
import { useGetProduct } from "../hooks/use-product";
import PageHeader from "@/shared/ui/page-header";
import { useUpdateMutation } from "@/shared/hooks/use-update-mutation";
import { useDropzone } from "react-dropzone";
import { UploadCloud, UserIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import { TiptapEditor } from "@/shared/ui/tiptap-editor";
import { useCategories } from "@/features/products/categories/hooks/use-categories";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import {
  PresignedUpload,
  sanitizeFileName,
  uploadToS3Put,
} from "@/lib/s3-upload";

type Props = {
  productId: string;
};

type FormValues = any;
const emptyLinks = { related: [], upsell: [], cross_sell: [] };

type LocalImage = {
  file: File;
  previewUrl: string;
};

const MAX_SIMPLE_IMAGES = 9;
const MAX_VARIABLE_IMAGES = 3;

export function EditProduct({ productId }: Props) {
  const axios = useAxiosAuth();
  const { activeStoreId } = useStoreScope();
  const { data: session, status } = useSession();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { data: product, isLoading } = useGetProduct(productId, session);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const { createCategory } = useCategories(session, axios, activeStoreId);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // new images only (local)
  const [localImages, setLocalImages] = useState<LocalImage[]>([]);

  const defaultValues = useMemo(
    () => ({
      name: "",
      description: "",
      status: "draft",
      productType: "variable",
      categoryIds: [],
      links: emptyLinks,
      seoTitle: "",
      seoDescription: "",
      howItFeelsAndLooks: "",
      whyYouWillLoveIt: "",
      details: "",
      images: [],
      defaultImageIndex: 0,
      moq: 0,
    }),
    [],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(CreateProductSchema),
    defaultValues,
    mode: "onSubmit",
  });

  const watchedProductType =
    useWatch({ control: form.control, name: "productType" }) ?? "variable";

  const maxImages = useMemo(
    () =>
      watchedProductType === "variable"
        ? MAX_VARIABLE_IMAGES
        : MAX_SIMPLE_IMAGES,
    [watchedProductType],
  );

  // cleanup object URLs
  useEffect(() => {
    return () => {
      localImages.forEach((i) => URL.revokeObjectURL(i.previewUrl));
    };
  }, [localImages]);

  // hydrate form when product loads
  useEffect(() => {
    if (!product) return;

    const md = (product as any).metadata ?? {};

    form.reset({
      name: (product as any).name ?? "",
      description: (product as any).description ?? "",
      status: (product as any).status ?? "draft",
      productType: (product as any).productType ?? "variable",
      categoryIds: (product as any).categoryIds ?? [],
      links: (product as any).links ?? emptyLinks,
      seoTitle: (product as any).seoTitle ?? "",
      seoDescription: (product as any).seoDescription ?? "",
      howItFeelsAndLooks: md.how_it_feels_and_looks ?? "",
      whyYouWillLoveIt: md.why_you_will_love_it ?? "",
      details: md.details ?? "",
      images: [],
      defaultImageIndex: (product as any).defaultImageIndex ?? 0,
      moq: (product as any).moq ?? "",
    });

    // clear local images when switching product
    setLocalImages((prev) => {
      prev.forEach((i) => URL.revokeObjectURL(i.previewUrl));
      return [];
    });
  }, [product, form]);

  // enforce limit when type changes
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

  const updateProduct = useUpdateMutation({
    endpoint: `/api/catalog/products/${productId}`,
    successMessage: "Product updated successfully",
    refetchKey: "product products",
  });

  async function presignUploads(files: File[]) {
    const payload = {
      count: files.length,
      files: files.map((f) => ({
        fileName: sanitizeFileName(f.name || `upload-${Date.now()}`),
        mimeType: f.type || "image/jpeg",
      })),
      storeId: activeStoreId,
      productId,
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

    return {
      storeId: activeStoreId,
      name: values.name,
      description: values.description ?? null,
      status: values.status,
      productType: values.productType as any,
      seoTitle: values.seoTitle ?? null,
      seoDescription: values.seoDescription ?? null,
      categoryIds: values.categoryIds ?? [],
      links: values.links ?? emptyLinks,
      metadata: md,
      moq: values.moq ?? "",
      // ✅ only send if replacing images (user selected new ones)
      images: imagesDto,
      defaultImageIndex:
        (values.productType ?? "variable") === "variable"
          ? 0
          : typeof values.defaultImageIndex === "number"
            ? values.defaultImageIndex
            : 0,
    };
  };

  const onSubmit: SubmitHandler<any> = async (values) => {
    setSubmitError(null);

    try {
      setIsSubmitting(true);

      let imagesDto: any[] | undefined = undefined;

      // only replace images if user picked new ones
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

      const payload = buildPayload(values, imagesDto);

      await updateProduct(payload, setSubmitError);

      // clear after save
      setLocalImages((prev) => {
        prev.forEach((i) => URL.revokeObjectURL(i.previewUrl));
        return [];
      });
      form.setValue("images", [], { shouldDirty: false });
      if (maxImages === 3)
        form.setValue("defaultImageIndex", 0, { shouldDirty: false });
    } catch (e: any) {
      setSubmitError(e?.message ?? "Failed to update product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStatus = product ? (product as any).status : "draft";
  const watchedStatus = useWatch({ control: form.control, name: "status" });
  const displayStatus = watchedStatus ?? currentStatus;
  const productType =
    useWatch({ control: form.control, name: "productType" }) ?? "variable";

  const currentDefault =
    useWatch({ control: form.control, name: "defaultImageIndex" }) ?? 0;

  const openStatusEditor = () => {
    form.setValue("status", currentStatus, { shouldDirty: false });
    setIsEditingStatus(true);
  };

  if (status === "loading" && isLoading) return <Loading />;

  const savedImages = ((product as any)?.images ?? []) as Array<any>;
  const savedSorted = [...savedImages].sort(
    (a: any, b: any) => (a.position ?? 0) - (b.position ?? 0),
  );

  const displayImages = localImages.length
    ? localImages.map((u) => ({ src: u.previewUrl, isNew: true }))
    : savedSorted
        .slice(0, maxImages)
        .map((s: any) => ({ src: s.url ?? s.src, isNew: false }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit product"
        description="Update product details, categories and linked products."
      >
        <Button
          type="submit"
          form="edit-product-form"
          disabled={isSubmitting}
          isLoading={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save changes"}
        </Button>
      </PageHeader>

      <Form {...form}>
        <form
          id="edit-product-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT */}
            <div className="lg:col-span-8 space-y-6">
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
                  <div className="grid grid-cols-2 gap-3">
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
                          value={field.value ?? ""}
                          onChange={field.onChange}
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
                          value={field.value ?? ""}
                          onChange={field.onChange}
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
                  name="seoDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SEO description</FormLabel>
                      <FormControl>
                        <Textarea
                          value={field.value ?? ""}
                          onChange={field.onChange}
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

            {/* RIGHT */}
            <div className="lg:col-span-4 space-y-6">
              <div className="rounded-lg border p-4 space-y-4">
                {!isEditingStatus ? (
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Status: </span>{" "}
                      <span className="font-medium">
                        {STATUS_LABEL[displayStatus] ?? displayStatus}
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant="clean"
                      size="sm"
                      onClick={openStatusEditor}
                    >
                      Edit
                    </Button>
                  </div>
                ) : (
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

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="clean"
                        size="sm"
                        onClick={() => {
                          form.setValue("status", currentStatus, {
                            shouldDirty: false,
                          });
                          setIsEditingStatus(false);
                        }}
                      >
                        Cancel
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setIsEditingStatus(false)}
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                )}
              </div>

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
                          type="number"
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
                <SectionHeading>{`Images (up to ${maxImages})`}</SectionHeading>

                <div
                  {...getRootProps()}
                  className={cn(
                    "border rounded-lg w-full flex flex-col items-center justify-center p-6",
                    "border-dashed cursor-pointer hover:border-primary",
                  )}
                >
                  <input {...getInputProps()} />

                  {displayImages.length ? (
                    <div className="grid grid-cols-3 gap-2 w-full">
                      {displayImages.slice(0, maxImages).map((img, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "relative rounded-lg overflow-hidden border",
                            idx === currentDefault ? "ring-2 ring-primary" : "",
                          )}
                        >
                          {localImages.length ? (
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
                          ) : null}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDefaultImageIndex(idx);
                            }}
                            className="absolute bottom-1 left-1 z-10 rounded-md bg-background/80 px-2 py-1 text-xs hover:bg-background"
                          >
                            {idx === currentDefault ? "Default" : "Set default"}
                          </button>

                          <Image
                            src={img.src}
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
                        <p>{`Drag & drop or click to upload (up to ${maxImages})`}</p>
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

              <div className="rounded-lg border p-4 space-y-2">
                <SectionHeading>Categories</SectionHeading>
                <CategoryCheckboxPicker
                  name="categoryIds"
                  onCreateCategory={async (payload, setError) =>
                    createCategory(payload, setError)
                  }
                />
              </div>

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
