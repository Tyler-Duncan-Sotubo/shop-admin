import { z } from "zod";

export const CategorySchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional(),
  parentId: z.string().nullable().optional(),
  isActive: z.boolean(),
});

export type CategoryFormValues = z.infer<typeof CategorySchema>;
