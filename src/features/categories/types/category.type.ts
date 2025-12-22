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
};

export type CreateCategoryPayload = {
  name: string;
  slug?: string;
  description?: string | null;
  parentId?: string | null;
  isActive?: boolean;
  metadata?: Record<string, any>;
};

export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;
