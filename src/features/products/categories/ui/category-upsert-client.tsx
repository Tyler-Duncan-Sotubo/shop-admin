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
import { UploadCloud, ImageIcon, X } from "lucide-react";
import { TiptapEditor } from "@/shared/ui/tiptap-editor";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import { slugify } from "@/shared/utils/slugify";
import axios from "axios";

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

type PresignResp = {
  uploads: Array<{ key: string; uploadUrl: string; url: string }>;
};

type PendingUpload = {
  key: string;
  url: string;
  fileName: string;
  mimeType: string;
};

export function CategoryUpsertClient({
  mode,
  categoryId,
  initial,
  afterSubmitPath,
}: Props) {
  const router = useRouter();
  const { activeStoreId } = useStoreScope();
  const axiosForServer = useAxiosAuth();
  const { data: session } = useSession();

  const { categories, createCategory, storeKey } = useCategories(
    session,
    axiosForServer,
    activeStoreId
  );

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [loadedCategory, setLoadedCategory] = useState<Category | null>(
    initial ?? null
  );

  // image display
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string>("");
  const [imageMimeType, setImageMimeType] = useState<string>("image/jpeg");

  // pending presigned upload info to attach on submit
  const [pendingUpload, setPendingUpload] = useState<PendingUpload | null>(
    null
  );

  // ✅ tells backend to clear imageMediaId on update
  const [removeImage, setRemoveImage] = useState<boolean>(false);

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
      base64Image: "", // legacy field kept for schema compat
    },
    mode: "onSubmit",
  });

  // category + products (edit mode)
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
      const res = await axiosForServer.get(
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

  // hydrate form
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
    setUploadedImage(existingUrl ?? null);

    // reset upload state on load
    setPendingUpload(null);
    setRemoveImage(false);
    setImageFileName("");
    setImageMimeType("image/jpeg");
  }, [categoryBundleQ.data]); // eslint-disable-line react-hooks/exhaustive-deps

  const categoryProducts = useMemo(() => {
    const payload = categoryBundleQ.data?.data ?? categoryBundleQ.data;
    return (payload?.products ?? []) as any[];
  }, [categoryBundleQ.data]);

  const productsTotal = useMemo(() => {
    const payload = categoryBundleQ.data?.data ?? categoryBundleQ.data;
    return Number(payload?.total ?? 0);
  }, [categoryBundleQ.data]);

  // parent options (exclude self)
  const parentOptions = useMemo(() => {
    const selfId = loadedCategory?.id ?? categoryId;
    return (categories ?? []).filter((c) => c.id !== selfId);
  }, [categories, loadedCategory?.id, categoryId]);

  // upload on drop (presign -> PUT)
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles?.[0];
      if (!file) return;

      if (!activeStoreId) {
        setSubmitError("No active store selected");
        return;
      }

      setSubmitError(null);

      const fileName = file.name || `upload-${Date.now()}.jpg`;
      const mimeType = file.type || "image/jpeg";

      setImageFileName(fileName);
      setImageMimeType(mimeType);

      try {
        // 1) presign (Next route -> backend)
        const presignRes = await axios.post<PresignResp>(
          "/api/uploads/media-presign",
          {
            storeId: activeStoreId,
            folder: "categories",
            files: [{ fileName, mimeType }],
          }
        );

        const uploads =
          (presignRes.data as any)?.uploads ??
          (presignRes.data as any)?.data?.uploads;
        const u = uploads?.[0];

        if (!u?.uploadUrl || !u?.key || !u?.url) {
          throw new Error("Invalid presign response");
        }

        // 2) PUT to S3
        const putRes = await fetch(u.uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": mimeType },
        });

        if (!putRes.ok) {
          const txt = await putRes.text().catch(() => "");
          throw new Error(
            `S3 upload failed (${putRes.status}): ${txt || "unknown"}`
          );
        }

        // 3) preview + save pending upload for submit
        setUploadedImage(u.url);
        setPendingUpload({
          key: u.key,
          url: u.url,
          fileName,
          mimeType,
        });

        // if they upload a new image in edit mode, don't remove
        setRemoveImage(false);

        form.setValue("base64Image", "", {
          shouldDirty: true,
          shouldValidate: false,
        });
      } catch (e: any) {
        setPendingUpload(null);
        setSubmitError(e?.message ?? "Upload failed");
      }
    },
    [activeStoreId, form]
  );

  const clearPendingImage = useCallback(() => {
    setUploadedImage(null);
    setPendingUpload(null);
    setImageFileName("");
    setImageMimeType("image/jpeg");

    // ✅ tell backend to clear existing image on update
    if (mode === "edit") setRemoveImage(true);

    form.setValue("base64Image", "", {
      shouldDirty: true,
      shouldValidate: false,
    });
  }, [form, mode]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

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

      // ✅ backend expects flat fields
      ...(pendingUpload
        ? {
            uploadKey: pendingUpload.key,
            uploadUrl: pendingUpload.url,
            imageFileName: pendingUpload.fileName,
            imageMimeType: pendingUpload.mimeType,
            imageAltText: name ? `${name} category image` : "Category image",
          }
        : {}),

      // ✅ removal flag for update
      ...(mode === "edit" && removeImage ? { removeImage: true } : {}),
    } as any;
  };

  const onSubmit: SubmitHandler<any> = async (values) => {
    setSubmitError(null);

    let payload: CategoryUpsertPayload;
    try {
      payload = buildPayload(values);
    } catch (e: any) {
      setSubmitError(e?.message ?? "Invalid form values");
      setIsSubmitting(false);
      return;
    }

    // CREATE
    if (mode === "create") {
      try {
        setIsSubmitting(true);
        const created = await createCategory(payload as any);
        const id = created?.id ?? created?.data?.id;
        if (!id) throw new Error("Category created but no id returned.");

        router.push(
          afterSubmitPath ? afterSubmitPath(id) : "/products?tab=collections"
        );
        return;
      } catch (err: any) {
        setSubmitError(err?.message ?? "Failed to create category");
        return;
      } finally {
        setIsSubmitting(false);
      }
    }

    // EDIT
    if (!categoryId) {
      setSubmitError("Missing category id");
      setIsSubmitting(false);
      return;
    }

    try {
      setIsSubmitting(true);
      await updateCategory(payload as any, (msg) => setSubmitError(msg));
      router.push(
        afterSubmitPath
          ? afterSubmitPath(categoryId)
          : "/products?tab=collections"
      );
      return;
    } catch (err: any) {
      setSubmitError(err?.message ?? "Failed to update category");
      return;
    } finally {
      setIsSubmitting(false);
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
          isLoading={isSubmitting}
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
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          clearPendingImage();
                        }}
                        className="absolute -top-2 -right-2 z-10 rounded-full bg-background/90 p-1 border hover:bg-background"
                        aria-label="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </button>

                      <Image
                        src={uploadedImage}
                        alt="Category image"
                        className="rounded-lg object-cover"
                        width={220}
                        height={220}
                      />
                    </div>
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

                {/* keep for schema validation error display if needed */}
                <FormField
                  control={form.control}
                  name="base64Image"
                  render={() => (
                    <FormItem>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {pendingUpload ? (
                  <div className="text-xs text-muted-foreground space-y-1">
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
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
