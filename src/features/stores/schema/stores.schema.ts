import z from "zod";

export const StoreSchema = z.object({
  name: z.string().min(1, "Store name is required"),
  slug: z.string(),
  defaultCurrency: z.string().min(1, "Currency is required"),
  defaultLocale: z.string().min(1, "Locale is required"),
  isActive: z.boolean(),
});

export type StoreFormValues = z.infer<typeof StoreSchema>;
