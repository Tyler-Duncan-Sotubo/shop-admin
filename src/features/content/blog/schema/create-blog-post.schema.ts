import { z } from "zod";

export const BlogPostStatusSchema = z.enum(["draft", "published"]);

export const BlogPostProductLinkSchema = z.object({
  productId: z.uuid(),
  sortOrder: z.number().int().min(0).optional(),
});

export const CreateBlogPostSchema = z.object({
  title: z.string().min(3, "Title is required").max(220),
  slug: z.string(),
  excerpt: z.string().max(400).nullable().optional(),
  coverImageUrl: z.string().nullable().optional(),
  content: z.string().min(1, "Content is required"),
  status: BlogPostStatusSchema,
  isFeatured: z.boolean(),
  seoTitle: z.string().max(70).nullable().optional(),
  seoDescription: z.string().max(160).nullable().optional(),
  products: z.array(BlogPostProductLinkSchema),
  base64CoverImage: z.string().nullable().optional(),
  focusKeyword: z.string().max(70).optional(),
});

export type CreateBlogPostValues = z.infer<typeof CreateBlogPostSchema>;
