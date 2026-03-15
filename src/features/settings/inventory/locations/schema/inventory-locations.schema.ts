import z from "zod";

export const InventoryLocationSchema = z.object({
  name: z.string().min(1, "Location name is required"),
  code: z.string().optional(),
  type: z.enum(["warehouse", "retail"]),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  isActive: z.boolean(),
});

export type InventoryLocationFormValues = z.infer<
  typeof InventoryLocationSchema
>;
