/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import PageHeader from "@/shared/ui/page-header";
import { SectionHeading } from "@/shared/ui/section-heading";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Switch } from "@/shared/ui/switch";
import { Button } from "@/shared/ui/button";
import { cn } from "@/lib/utils";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { UploadCloud, ImageIcon } from "lucide-react";
import { TiptapEditor } from "@/shared/ui/tiptap-editor";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import { slugify } from "@/shared/utils/slugify";

import type {
  Category,
  CategoryUpsertPayload,
  UpdateCategoryPayload,
} from "@/features/products/categories/types/category.type";

import { useCategories } from "../hooks/use-categories";
import { CategoryUpsertSchema } from "../schema/category.schema";
import { useUpdateMutation } from "@/shared/hooks/use-update-mutation";
import { CategoryProductsTableLite } from "./category-products";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { BackButton } from "@/shared/ui/back-button";
import { FaPlus } from "react-icons/fa6";

type Props = {
  mode: "create" | "edit";
  categoryId?: string;
  initial?: Category | null;
  afterSubmitPath?: (id: string) => string;
};

export function CategoryUpsertClient({
  mode,
  categoryId,
  initial,
  afterSubmitPath,
}: Props) {
  const router = useRouter();
  const { activeStoreId } = useStoreScope();
  const axios = useAxiosAuth();
  const { data: session } = useSession();

  const { categories, createCategory, storeKey } = useCategories(
    session,
    axios,
    activeStoreId
  );

  const [submitError, setSubmitError] = useState<string | null>(null);

  // edit payload state
  const [loadedCategory, setLoadedCategory] = useState<Category | null>(
    initial ?? null
  );

  // image state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string>("");
  const [imageMimeType, setImageMimeType] = useState<string>("image/jpeg");

  const form = useForm({
    resolver: zodResolver(CategoryUpsertSchema),
    defaultValues: {
      name: "",
      description: "",
      afterContentHtml: "",
      parentId: null,
      isActive: true,
      metaTitle: "",
      metaDescription: "",
      base64Image: "",
    },
    mode: "onSubmit",
  });

  // ✅ useQuery for category + products (enabled by BOTH session + storeId + categoryId)
  const categoryBundleQ = useQuery<any>({
    queryKey: [
      "categories",
      "admin",
      "with-products",
      activeStoreId,
      categoryId,
      50,
      0,
      "",
    ],
    enabled:
      mode === "edit" &&
      !!categoryId &&
      !!session?.backendTokens?.accessToken &&
      !!activeStoreId,
    queryFn: async () => {
      const res = await axios.get(
        `/api/catalog/categories/${categoryId}/products/admin`,
        {
          params: {
            storeId: activeStoreId,
            limit: 50,
            offset: 0,
            search: undefined,
          },
        }
      );
      return res.data;
    },
    retry: (failureCount, err: any) => {
      const code = err?.response?.status;
      if (code === 401 || code === 403) return false;
      return failureCount < 2;
    },
  });

  // hydrate form from query result
  useEffect(() => {
    if (mode !== "edit") return;
    const payload = categoryBundleQ.data?.data ?? categoryBundleQ.data;
    const c = payload?.category ?? null;

    if (!c) return;

    setLoadedCategory(c);

    form.reset({
      name: c.name ?? "",
      description: (c as any).description ?? "",
      afterContentHtml: (c as any).afterContentHtml ?? "",
      parentId: c.parentId ?? null,
      isActive: c.isActive ?? true,
      metaTitle: (c as any).metaTitle ?? "",
      metaDescription: (c as any).metaDescription ?? "",
      base64Image: "",
    });

    const existingUrl = (c as any).imageUrl as string | undefined;
    if (existingUrl) setUploadedImage(existingUrl);
  }, [categoryBundleQ.data]); // eslint-disable-line react-hooks/exhaustive-deps

  const categoryProducts = useMemo(() => {
    const payload = categoryBundleQ.data?.data ?? categoryBundleQ.data;
    return (payload?.products ?? []) as any[];
  }, [categoryBundleQ.data]);

  const productsTotal = useMemo(() => {
    const payload = categoryBundleQ.data?.data ?? categoryBundleQ.data;
    return Number(payload?.total ?? 0);
  }, [categoryBundleQ.data]);

  // parent options (exclude self on edit)
  const parentOptions = useMemo(() => {
    const selfId = loadedCategory?.id ?? categoryId;
    return (categories ?? []).filter((c) => c.id !== selfId);
  }, [categories, loadedCategory?.id, categoryId]);

  // dropzone
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

  const updateCategory = useUpdateMutation<UpdateCategoryPayload>({
    endpoint: `/api/catalog/categories/${categoryId}`,
    successMessage: "Category updated successfully",
    method: "PATCH",
    refetchKey: ["categories", "admin", storeKey] as any,
  });

  const buildPayload = (values: any): CategoryUpsertPayload => {
    const name = values.name?.trim() ?? "";
    const slug =
      (values.slug?.trim() ? slugify(values.slug) : slugify(name)) || "";

    if (!activeStoreId) throw new Error("No active store selected");

    const base64 = values.base64Image?.trim();

    return {
      storeId: activeStoreId,
      name,
      slug,
      description: values.description?.trim() || null,
      afterContentHtml: values.afterContentHtml?.trim() || null,
      parentId: values.parentId ?? null,
      isActive: !!values.isActive,
      metaTitle: values.metaTitle?.trim() || null,
      metaDescription: values.metaDescription?.trim() || null,

      base64Image: base64 || undefined,
      imageAltText: name ? `${name} category image` : "Category image",

      ...(base64
        ? {
            imageFileName: imageFileName?.trim() || undefined,
            imageMimeType: imageMimeType || "image/jpeg",
          }
        : {}),
    };
  };

  const onSubmit: SubmitHandler<any> = async (values) => {
    setSubmitError(null);

    let payload: CategoryUpsertPayload;
    try {
      payload = buildPayload(values);
    } catch (e: any) {
      setSubmitError(e?.message ?? "Invalid form values");
      return;
    }

    // CREATE
    if (mode === "create") {
      try {
        const created = await createCategory(payload as any);
        const id = created?.id ?? created?.data?.id;
        if (!id) throw new Error("Category created but no id returned.");

        router.push(
          afterSubmitPath ? afterSubmitPath(id) : "/products/categories"
        );
        return;
      } catch (err: any) {
        setSubmitError(err?.message ?? "Failed to create category");
        return;
      }
    }

    // EDIT
    if (!categoryId) {
      setSubmitError("Missing category id");
      return;
    }

    try {
      await updateCategory(payload as any, (msg) => setSubmitError(msg));
      router.push(
        afterSubmitPath ? afterSubmitPath(categoryId) : "/products/categories"
      );
      return;
    } catch (err: any) {
      setSubmitError(err?.message ?? "Failed to update category");
      return;
    }
  };

  return (
    <div className="space-y-6">
      <BackButton
        href="/products?tab=collections"
        label="Back to collections"
      />
      <PageHeader
        title={mode === "create" ? "New category" : "Edit category"}
        description={
          mode === "create"
            ? "Create a category (collection) for products."
            : "Update details, SEO and image."
        }
      >
        <Button
          type="submit"
          form="category-upsert-form"
          disabled={isSubmitting}
        >
          <FaPlus />{" "}
          {isSubmitting ? "Saving..." : mode === "create" ? "Create" : "Save"}
        </Button>
      </PageHeader>

      <Form {...form}>
        <form
          id="category-upsert-form"
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
                        <Input placeholder="e.g. Bedding" {...field} />
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
                          className="h-28 resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="rounded-lg border p-4 space-y-4">
                <SectionHeading>After content</SectionHeading>
                <FormField
                  control={form.control}
                  name="afterContentHtml"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <TiptapEditor
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          placeholder="Optional content shown after products…"
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
                  name="metaTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Optional"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="metaDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Optional"
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

              {mode === "edit" ? (
                <CategoryProductsTableLite
                  items={categoryProducts ?? []}
                  productsTotal={productsTotal}
                  categoryId={categoryId!}
                  // enableReorder={canFetch && !categoryBundleQ.isFetching}
                />
              ) : null}
            </div>

            {/* RIGHT */}
            <div className="lg:col-span-4 space-y-6">
              <div className="rounded-lg border p-4 space-y-4">
                <SectionHeading>Status</SectionHeading>

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-md border p-3">
                      <div className="space-y-1">
                        <FormLabel className="m-0">Active</FormLabel>
                        <FormDescription>
                          Inactive categories won’t show in storefront.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={!!field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="rounded-lg border p-4 space-y-4">
                <SectionHeading>Parent</SectionHeading>
                <FormField
                  control={form.control}
                  name="parentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <select
                          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? e.target.value : null
                            )
                          }
                        >
                          <option value="">No parent</option>
                          {parentOptions.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="rounded-lg border p-4 space-y-4">
                <SectionHeading>Category image</SectionHeading>

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
                      alt="Category image"
                      className="rounded-lg object-cover"
                      width={220}
                      height={220}
                    />
                  ) : (
                    <div className="flex h-40 w-full items-center justify-center rounded-lg bg-muted/30">
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
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
