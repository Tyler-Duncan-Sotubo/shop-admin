import { z } from "zod";

export const quoteItemSchema = z.object({
  productId: z.string().nullable(),
  variantId: z.string().nullable(),
  name: z.string().min(1, "Item name is required"),
  variantLabel: z.string().nullable(),
  attributes: z.record(z.string(), z.any()).nullable(),
  imageUrl: z.url("Invalid image URL").nullable(),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
});

export const createQuoteSchema = z.object({
  storeId: z.string("Store is required"),
  customerName: z.string().min(1, "Customer name is required"), // ← add
  customerEmail: z.email("Valid email is required"),
  customerNote: z.string().nullable(),
});

export const updateQuoteSchema = z.object({
  customerEmail: z.email("Valid email is required").optional(),
  customerNote: z.string().optional().nullable(),
  meta: z.record(z.string(), z.any()).optional().nullable(),
  status: z
    .enum(["new", "reviewing", "converted", "finalized", "archived"])
    .optional(),
});

export type QuoteItemFormValues = z.infer<typeof quoteItemSchema>;
export type CreateQuoteFormValues = z.infer<typeof createQuoteSchema>;
export type UpdateQuoteFormValues = z.infer<typeof updateQuoteSchema>;
