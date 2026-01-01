/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
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
import { CategoryCheckboxPicker } from "@/features/categories/ui/category-checkbox-picker";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { ProductUpsellCrossSellLinks } from "./product-upsell-cross-sell-link";
import PageHeader from "@/shared/ui/page-header";
import { useDropzone } from "react-dropzone";
import { UploadCloud, UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import { TiptapEditor } from "@/shared/ui/tiptap-editor";

type AddProductPageProps = {
  afterCreatePath?: (productId: string) => string;
};

export function AddProduct({ afterCreatePath }: AddProductPageProps) {
  const { activeStoreId } = useStoreScope();
  const router = useRouter();
  const { createProduct } = useCreateProduct();
  const { createCategory } = useCategories();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string>("");
  const [imageMimeType, setImageMimeType] = useState<string>("image/jpeg");

  const form = useForm({
    resolver: zodResolver(CreateProductSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "draft", // ✅ add this
      productType: "variable",
      categoryIds: [],
      links: { related: [], upsell: [], cross_sell: [] }, // ✅ backend-aligned
      seoTitle: "",
      seoDescription: "",
      howItFeelsAndLooks: "",
      whyYouWillLoveIt: "",
      details: "",
    },
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

  const isSubmitting = form.formState.isSubmitting;

  const buildPayload = (values: any): CreateProductPayload => {
    const md: Record<string, any> = {
      how_it_feels_and_looks: values.howItFeelsAndLooks ?? "",
      why_you_will_love_it: values.whyYouWillLoveIt ?? "",
      details: values.details ?? "",
    };

    // remove empty strings
    Object.keys(md).forEach((k) => {
      if (typeof md[k] === "string" && md[k].trim() === "") delete md[k];
    });

    return {
      storeId: activeStoreId, // ✅ add storeId to payload
      name: values.name,
      description: values.description ?? null,
      status: values.status ?? "draft",
      productType: values.productType as any,
      seoTitle: values.seoTitle ?? null,
      seoDescription: values.seoDescription ?? null,
      categoryIds: values.categoryIds ?? [],
      links: values.links ?? { related: [], upsell: [], cross_sell: [] }, // ✅
      metadata: md,
      base64Image: values.base64Image?.trim() || undefined,
      imageAltText: values.name || "Product image",

      // ✅ NEW: send meta only when image exists
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

    const payload = buildPayload(values);
    const created = await createProduct(payload, (msg) => setSubmitError(msg));
    const productId = created?.id ?? created?.data?.id;

    if (productId) {
      const next = afterCreatePath
        ? afterCreatePath(productId)
        : `/products/${productId}/variants`;
      router.push(next);
      return;
    }

    router.push(`/products`);
  };

  return (
    <div className="space-y-6 mt-6">
      <PageHeader
        title="Add product"
        description="Create the product shell first. You’ll set options/variants in step 2."
      >
        <Button type="submit" form="add-product-form" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create & continue"}
        </Button>
      </PageHeader>

      <Form {...form}>
        <form
          id="add-product-form"
          onSubmit={form.handleSubmit((values) => {
            onSubmit(values);
          })}
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
                        <Textarea
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                          className="h-44 resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                          placeholder="Key benefits, reasons to buy, unique selling points..."
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
              <div className="rounded-lg border p-4 space-y-4">
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
                              <SelectItem value="archived">Archive</SelectItem>
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

                  {uploadedImage ? (
                    <Image
                      src={uploadedImage}
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
