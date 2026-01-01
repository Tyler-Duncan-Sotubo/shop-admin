/* eslint-disable @typescript-eslint/no-explicit-any */
export type BlogPostStatus = "draft" | "published";

export type BlogPostProductLink = {
  productId: string;
  sortOrder?: number;
};

export type BlogPostListRow = {
  id: string;
  title: string;
  slug: string;
  status: BlogPostStatus;
  isFeatured: boolean;
  publishedAt: string | null;
  createdAt: string | Date;
  coverImageUrl: string | null;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  content: string;

  status: BlogPostStatus;
  isFeatured: boolean;
  publishedAt: string | null;

  seoTitle: string | null;
  seoDescription: string | null;

  createdAt: string;
  updatedAt: string;

  // if backend returns relations
  products?: Array<{
    productId: string;
    sortOrder: number;
    product?: any; // replace with Product type if you want
  }>;
};

export type CreateBlogPostPayload = {
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImageUrl?: string | null;
  content: string;

  status?: BlogPostStatus;
  isFeatured?: boolean;

  seoTitle?: string | null;
  seoDescription?: string | null;

  products?: BlogPostProductLink[];
};

export const BLOG_STATUS_LABEL: Record<BlogPostStatus, string> = {
  draft: "Draft",
  published: "Published",
};
