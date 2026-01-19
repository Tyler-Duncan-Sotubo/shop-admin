/* eslint-disable @typescript-eslint/no-explicit-any */
export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  isActive: boolean;
  metadata: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
  imageUrl?: string | null;
};

export type CreateCategoryPayload = {
  name: string;
  slug?: string;
  description?: string | null;
  parentId?: string | null;
  isActive?: boolean;
  metadata?: Record<string, any>;

  // optional SEO (if you already added to schema)
  metaTitle?: string | null;
  metaDescription?: string | null;
  afterContentHtml?: string | null;

  // image selection (choose one)
  imageMediaId?: string | null;
  base64Image?: string | null;
  imageMimeType?: string | null;
  imageFileName?: string | null;
  imageAltText?: string | null;

  removeImage?: boolean;
  storeId?: string;
};

export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;

/*
 * Payload sent to backend for BOTH create & update
 * (storeId is injected in the page, not the form)
 */
export type CategoryUpsertPayload = {
  storeId: string;

  name: string;
  slug: string;

  description?: string | null;
  afterContentHtml?: string | null;

  parentId?: string | null;
  isActive: boolean;

  // SEO
  metaTitle?: string | null;
  metaDescription?: string | null;

  // image upload
  base64Image?: string;
  imageFileName?: string;
  imageMimeType?: string;
  imageAltText?: string;

  // future: media picker
  imageMediaId?: string | null;
  removeImage?: boolean;
};
