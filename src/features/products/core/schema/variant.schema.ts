import { z } from "zod";

export const VariantSchema = z.object({
  // ---------- Identity ----------
  title: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),

  // ---------- Image ----------
  base64Image: z.string().optional().nullable(),

  // ---------- Pricing (NGN fixed) ----------
  regularPrice: z
    .string()
    .min(1, "Regular price is required")
    .refine((v) => !isNaN(Number(v)), "Must be a valid number"),

  salePrice: z
    .string()
    .optional()
    .nullable()
    .refine(
      (v) => v === null || v === "" || !isNaN(Number(v)),
      "Must be a valid number"
    ),

  // ---------- Dimensions ----------
  weight: z
    .string()
    .optional()
    .nullable()
    .refine(
      (v) => v === null || v === "" || !isNaN(Number(v)),
      "Must be a valid number"
    ),

  length: z
    .string()
    .optional()
    .nullable()
    .refine(
      (v) => v === null || v === "" || !isNaN(Number(v)),
      "Must be a valid number"
    ),

  width: z
    .string()
    .optional()
    .nullable()
    .refine(
      (v) => v === null || v === "" || !isNaN(Number(v)),
      "Must be a valid number"
    ),

  height: z
    .string()
    .optional()
    .nullable()
    .refine(
      (v) => v === null || v === "" || !isNaN(Number(v)),
      "Must be a valid number"
    ),

  // ---------- Inventory (form strings) ----------
  stockQuantity: z
    .string()
    .optional()
    .nullable()
    .refine(
      (v) => v === null || v === "" || !isNaN(Number(v)),
      "Must be a valid number"
    ),

  lowStockThreshold: z
    .string()
    .optional()
    .nullable()
    .refine(
      (v) => v === null || v === "" || !isNaN(Number(v)),
      "Must be a valid number"
    ),

  images: z.array(z.string()).optional().nullable(),
});

export type VariantFormValues = z.infer<typeof VariantSchema>;
