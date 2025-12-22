import { z } from "zod";

const arrayOfStrings = z.preprocess(
  (val) => (Array.isArray(val) ? val : []),
  z.array(z.string())
);

export const CreateProductSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().nullable().optional(),
  status: z.enum(["draft", "active", "archived"]).default("draft"),

  productType: z.string().optional(),

  categoryIds: arrayOfStrings,
  // ---------- Image ----------
  base64Image: z.string().optional().nullable(),
  links: z.preprocess(
    (val) =>
      val && typeof val === "object"
        ? val
        : { related: [], upsell: [], cross_sell: [] },
    z.object({
      related: arrayOfStrings,
      upsell: arrayOfStrings,
      cross_sell: arrayOfStrings,
    })
  ),

  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),

  howItFeelsAndLooks: z.string().nullable().optional(),
  whyYouWillLoveIt: z.string().nullable().optional(),
  details: z.string().nullable().optional(),
});
