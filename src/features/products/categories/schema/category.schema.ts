import { z } from "zod";

export const CategoryUpsertSchema = z.object({
  // edit-only
  id: z.string().optional().nullable(),
  name: z.string().min(2, "Name is required"),
  description: z.string().optional().nullable(),

  afterContentHtml: z.string().optional().nullable(),

  parentId: z.string().nullable().optional(),

  isActive: z.boolean(),

  // SEO
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),

  // image upload (AddProduct-compatible)
  base64Image: z.string().optional(),
  imageFileName: z.string().optional(),
  imageMimeType: z.string().optional(),
  imageAltText: z.string().optional(),

  // future: media picker
  imageMediaId: z.string().uuid().optional().nullable(),
  removeImage: z.boolean().optional(),
});

export type CategoryUpsertFormValues = z.infer<typeof CategoryUpsertSchema>;
