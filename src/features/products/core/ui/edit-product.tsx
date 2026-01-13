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
import { UploadCloud, UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import { TiptapEditor } from "@/shared/ui/tiptap-editor";
import { useCategories } from "@/features/products/categories/hooks/use-categories";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { BackButton } from "@/shared/ui/back-button";

type Props = {
  productId: string;
};

type FormValues = any; // keep any if you don’t want to fight types here

const emptyLinks = { related: [], upsell: [], cross_sell: [] };

export function EditProduct({ productId }: Props) {
  const axios = useAxiosAuth();
  const { activeStoreId } = useStoreScope();
  const { data: session, status } = useSession();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { data: product, isLoading } = useGetProduct(productId, session);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageVersion, setImageVersion] = useState<number>(() => Date.now());
  const [imageFileName, setImageFileName] = useState<string>("");
  const [imageMimeType, setImageMimeType] = useState<string>("image/jpeg");
  const { createCategory } = useCategories(session, axios, activeStoreId);

  const savedImageUrl = (product as any)?.imageUrl ?? null;

  const imageSrc = useMemo(() => {
    if (uploadedImage) return uploadedImage; // base64 preview
    if (!savedImageUrl) return null; // nothing saved yet
    const sep = savedImageUrl.includes("?") ? "&" : "?";
    return `${savedImageUrl}${sep}v=${imageVersion}`; // cache-bust after save
  }, [uploadedImage, savedImageUrl, imageVersion]);

  const defaultValues = useMemo(
    () => ({
      name: "",
      description: "",
      status: "draft", // ✅ add this
      productType: "variable",
      categoryIds: [],
      links: emptyLinks,
      seoTitle: "",
      seoDescription: "",
      howItFeelsAndLooks: "",
      whyYouWillLoveIt: "",
      details: "",
      base64Image: "",
    }),
    []
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(CreateProductSchema),
    defaultValues,
    mode: "onSubmit",
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setImageMimeType(file.type || "image/jpeg");
      setImageFileName(file.name || `upload-${Date.now()}.jpg`);
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

  const updateProduct = useUpdateMutation({
    endpoint: `/api/catalog/products/${productId}`,
    successMessage: "Product updated successfully",
    refetchKey: "product products",
  });

  // hydrate form when product loads
  useEffect(() => {
    if (!product) return;

    const md = (product as any).metadata ?? {};

    form.reset({
      name: product.name ?? "",
      description: product.description ?? "",
      status: (product as any).status ?? "draft",
      productType: (product as any).productType ?? "variable",
      categoryIds: (product as any).categoryIds ?? [],
      links: (product as any).links ?? emptyLinks,
      seoTitle: (product as any).seoTitle ?? "",
      seoDescription: (product as any).seoDescription ?? "",
      howItFeelsAndLooks: md.how_it_feels_and_looks ?? "",
      whyYouWillLoveIt: md.why_you_will_love_it ?? "",
      details: md.details ?? "",
      base64Image: "",
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUploadedImage(null);
  }, [product, form]);

  const isSubmitting = form.formState.isSubmitting;

  const buildPayload = (values: any): CreateProductPayload => {
    const md: Record<string, any> = {
      how_it_feels_and_looks: values.howItFeelsAndLooks ?? "",
      why_you_will_love_it: values.whyYouWillLoveIt ?? "",
      details: values.details ?? "",
    };

    Object.keys(md).forEach((k) => {
      if (typeof md[k] === "string" && md[k].trim() === "") delete md[k];
    });

    return {
      name: values.name,
      description: values.description ?? null,
      status: values.status, // ✅ add this
      productType: values.productType as any,
      seoTitle: values.seoTitle ?? null,
      seoDescription: values.seoDescription ?? null,
      categoryIds: values.categoryIds ?? [],
      links: values.links ?? emptyLinks,
      metadata: md,
      base64Image: values.base64Image?.trim() || undefined,
      storeId: activeStoreId,
      ...(values.base64Image?.trim()
        ? {
            imageFileName: imageFileName?.trim() || undefined,
            imageMimeType: imageMimeType || "image/jpeg",
          }
        : {}),
    };
  };

  const onSubmit: SubmitHandler<any> = async (values) => {
    setSubmitError(null);
    setImageVersion(() => Date.now());
    try {
      const payload = buildPayload(values);
      await updateProduct(payload, setSubmitError);
    } catch (e: any) {
      setSubmitError(e?.message ?? "Failed to update product");
    }
  };

  const currentStatus = product ? (product as any).status : "draft";
  const watchedStatus = useWatch({
    control: form.control,
    name: "status",
  });
  const displayStatus = watchedStatus ?? currentStatus;

  const openStatusEditor = () => {
    form.setValue("status", currentStatus, { shouldDirty: false });
    setIsEditingStatus(true);
  };

  if (status === "loading" && isLoading) return <Loading />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit product"
        description="Update product details, categories and linked products."
      >
        <Button type="submit" form="edit-product-form" disabled={isSubmitting}>
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
                        <Textarea
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          className="h-44 resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                          className="h-24 resize-none"
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
                          className="h-24 resize-none"
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
                              value={field.value ?? undefined} // ✅ don’t coerce to ""
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
                          // revert to current product status & close editor
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

              <div className="rounded-lg border p-4 space-y-4">
                <SectionHeading>Default image</SectionHeading>

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
                      alt="Product image"
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

                {/* keep base64Image in the form */}
                <FormField
                  control={form.control}
                  name="base64Image"
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
                  onCreateCategory={async (payload, setError) => {
                    return createCategory(payload, setError);
                  }}
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
