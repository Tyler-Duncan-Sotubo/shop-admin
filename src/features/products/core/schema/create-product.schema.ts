import { z } from "zod";

const arrayOfStrings = z.preprocess(
  (val) => (Array.isArray(val) ? val : []),
  z.array(z.string()),
);

export const CreateProductSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().nullable().optional(),
  status: z.enum(["draft", "active", "archived"]).default("draft"),

  productType: z.string().optional(),

  categoryIds: arrayOfStrings,

  // ---------- Images (max 9) ----------
  images: z
    .preprocess(
      (val) => (Array.isArray(val) ? val : []),
      z
        .array(
          z.object({
            base64: z.string().min(1, "Image is required"),
            fileName: z.string().min(1, "File name is required"),
            mimeType: z.string().min(1, "Mime type is required"),
            altText: z.string().optional(),
            position: z.number().int().min(0).optional(),
          }),
        )
        .max(9, "You can upload up to 9 images"),
    )
    .optional(),

  defaultImageIndex: z.number().int().min(0).max(8).optional().default(0),

  links: z.preprocess(
    (val) =>
      val && typeof val === "object"
        ? val
        : { related: [], upsell: [], cross_sell: [] },
    z.object({
      related: arrayOfStrings,
      upsell: arrayOfStrings,
      cross_sell: arrayOfStrings,
    }),
  ),

  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),

  howItFeelsAndLooks: z.string().nullable().optional(),
  whyYouWillLoveIt: z.string().nullable().optional(),
  details: z.string().nullable().optional(),

  // -----------------------------
  // Simple product fields (top-level)
  // Only required/used if productType === "simple"
  // -----------------------------
  sku: z.string().nullable().optional(),
  barcode: z.string().nullable().optional(),

  regularPrice: z.string().nullable().optional(), // keep as string to match your variant dialog style
  salePrice: z.string().nullable().optional(),

  stockQuantity: z.string().nullable().optional(),
  lowStockThreshold: z.string().nullable().optional(),

  weight: z.string().nullable().optional(),
  length: z.string().nullable().optional(),
  width: z.string().nullable().optional(),
  height: z.string().nullable().optional(),

  moq: z.transform(Number).pipe(z.number()),
});
