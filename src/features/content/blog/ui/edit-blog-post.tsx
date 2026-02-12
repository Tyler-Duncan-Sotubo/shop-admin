/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useState } from "react";
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
import PageHeader from "@/shared/ui/page-header";
import { SectionHeading } from "@/shared/ui/section-heading";
import { cn } from "@/lib/utils";
import { Switch } from "@/shared/ui/switch";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { UploadCloud, UserIcon } from "lucide-react";
import { TiptapEditor } from "@/shared/ui/tiptap-editor";
import { BlogProductsPicker } from "./blog-products-picker";
import { useGetBlogPost, useUpdateBlogPost } from "../hooks/use-blog-post";
import { BlogPostStatus, CreateBlogPostPayload } from "../types/blog-post.type";
import { slugify } from "@/shared/utils/slugify";
import { CreateBlogPostSchema } from "../schema/create-blog-post.schema";
import { useSession } from "next-auth/react";
import { SeoScoreCard } from "./seo-score-card";
import { SeoQuickPanel } from "./seo-quick-panel";

type EditBlogPostProps = {
  postId: string;
  afterSavePath?: (id: string) => string;
  uploadEndpoint?: string; // same as tiptap: "/api/media/editor-image"
  session?: { backendTokens?: { accessToken?: string } } | null;
};

export function EditBlogPost({ postId, afterSavePath }: EditBlogPostProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { data: post, isLoading } = useGetBlogPost(postId, session);
  const { updateBlogPost } = useUpdateBlogPost(postId);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // cover image preview (existing URL or new base64)
  const [uploadedCover, setUploadedCover] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(CreateBlogPostSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      status: "draft" as BlogPostStatus,
      isFeatured: false,
      seoTitle: "",
      seoDescription: "",
      coverImageUrl: "",
      base64CoverImage: null as string | null,
      products: [],
    },
    mode: "onSubmit",
  });

  // Fill form from server post
  useEffect(() => {
    if (!post) return;

    form.reset({
      title: post.title ?? "",
      slug: post.slug ?? "",
      excerpt: post.excerpt ?? "",
      content: post.content ?? "",
      status: (post.status ?? "draft") as any,
      isFeatured: !!post.isFeatured,
      seoTitle: post.seoTitle ?? "",
      seoDescription: post.seoDescription ?? "",
      coverImageUrl: post.coverImageUrl ?? "",
      base64CoverImage: null,
      products:
        (post.products ?? []).map((p: any) => ({
          productId: p.productId ?? p.id, // depends on your API shape
          sortOrder: p.sortOrder ?? 0,
        })) ?? [],
    });

    setUploadedCover(post.coverImageUrl ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post]);

  const titleValue = form.watch("title");
  const focusKeyword = form.watch("focusKeyword"); // or seo.focusKeyword
  const seoTitle = form.watch("seoTitle");
  const seoDescription = form.watch("seoDescription");
  const slug = form.watch("slug");
  const content = form.watch("content"); // HTML from tiptap

  useEffect(() => {
    const currentSlug = form.getValues("slug") as string;
    if (!currentSlug) {
      form.setValue("slug", slugify(titleValue ?? ""), {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [titleValue]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setUploadedCover(base64);

        form.setValue("base64CoverImage", base64, {
          shouldDirty: true,
          shouldValidate: true,
        });
      };
      reader.readAsDataURL(file);
    },
    [form],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const isSubmitting = form.formState.isSubmitting;

  const buildPayload = (values: any): CreateBlogPostPayload => {
    return {
      title: values.title,
      slug: values.slug, // readonly; keep existing
      excerpt: values.excerpt ?? null,
      content: values.content,
      status: values.status ?? "draft",
      isFeatured: values.isFeatured ?? false,
      seoTitle: values.seoTitle ?? null,
      seoDescription: values.seoDescription ?? null,

      // ✅ only send base64 if user changed image
      base64CoverImage: values.base64CoverImage?.trim() || undefined,

      // linked products
      products: values.products ?? [],
    } as any;
  };

  const onSubmit: SubmitHandler<any> = async (values) => {
    setSubmitError(null);

    const payload = buildPayload(values);
    const updated = await updateBlogPost(payload, (msg: string) =>
      setSubmitError(msg),
    );

    const id = updated?.id ?? postId;
    router.push(afterSavePath ? afterSavePath(id) : "/content/blog");
  };

  if (isLoading || !post) {
    return (
      <div className="mt-6 rounded-lg border p-6 text-sm text-muted-foreground">
        Loading blog post…
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-6">
      <PageHeader
        title="Edit blog post"
        description="Update your post, cover image, and linked products."
      >
        <Button
          type="submit"
          form="edit-blog-post-form"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save changes"}
        </Button>
      </PageHeader>

      <Form {...form}>
        <form
          id="edit-blog-post-form"
          onSubmit={form.handleSubmit((values) => onSubmit(values))}
          className="space-y-6"
        >
          {/* Form SubmitErrors */}
          {submitError && (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
              {submitError}
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT */}
            <div className="lg:col-span-8 space-y-6">
              <div className="rounded-lg border p-4 space-y-4">
                <SectionHeading>Basic information</SectionHeading>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Post title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly className="bg-muted/40" />
                      </FormControl>
                      <div className="text-xs text-muted-foreground">
                        Slug is read-only on edit.
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Excerpt</FormLabel>
                      <FormControl>
                        <Textarea
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          className="h-24 resize-none"
                          placeholder="Short summary (optional)"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="rounded-lg border p-4 space-y-4">
                <SectionHeading>Content</SectionHeading>
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Body</FormLabel>
                      <FormControl>
                        <TiptapEditor
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          placeholder="Write your post…"
                          maxCharacters={20000}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="rounded-lg border p-4 space-y-6">
                <SectionHeading>SEO</SectionHeading>
                <SeoQuickPanel
                  form={form}
                  allowSlugEdit={true} // set false in edit mode if you want slug locked
                  autoSuggest={true}
                />
                <FormField
                  control={form.control}
                  name="focusKeyword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Focus keyword</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-muted/40"
                          placeholder="Add focus keyword"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <SeoScoreCard
                  focusKeyword={focusKeyword}
                  seoTitle={seoTitle ?? ""}
                  seoDescription={seoDescription ?? ""}
                  slug={slug ?? ""}
                  contentHtml={content ?? ""}
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
                <SectionHeading>Publishing</SectionHeading>

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value ?? "draft"}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-64">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-md border p-3">
                      <div>
                        <FormLabel>Featured</FormLabel>
                        <div className="text-xs text-muted-foreground">
                          Show this post in featured sections
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={!!field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Cover */}
              <div className="rounded-lg border p-4 space-y-4">
                <SectionHeading>Cover image</SectionHeading>

                <div
                  {...getRootProps()}
                  className={cn(
                    "border rounded-lg w-full flex flex-col items-center justify-center p-6",
                    "border-dashed cursor-pointer hover:border-primary",
                    isDragActive && "border-primary",
                  )}
                >
                  <input {...getInputProps()} />

                  {uploadedCover ? (
                    uploadedCover.startsWith("data:") ? (
                      <Image
                        src={uploadedCover}
                        alt="Cover preview"
                        className="rounded-lg object-cover"
                        width={220}
                        height={220}
                      />
                    ) : (
                      <Image
                        src={uploadedCover}
                        alt="Cover preview"
                        className="rounded-lg object-cover"
                        width={220}
                        height={220}
                      />
                    )
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

                {/* keep base64CoverImage in the form */}
                <FormField
                  control={form.control}
                  name="base64CoverImage"
                  render={() => (
                    <FormItem>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="text-xs text-muted-foreground">
                  Uploading a new image will replace the existing cover image.
                </div>
              </div>

              {/* Linked products */}
              <div className="rounded-lg border p-4 space-y-2">
                <SectionHeading>Linked products</SectionHeading>
                <BlogProductsPicker session={session} />
                <div className="text-xs text-muted-foreground">
                  Post categories can be derived from linked products.
                </div>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
