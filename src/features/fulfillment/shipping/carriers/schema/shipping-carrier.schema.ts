import { z } from "zod";

export const ShippingCarrierSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  providerKey: z
    .string()
    .min(1, "Provider key is required")
    .regex(/^[a-z0-9_-]+$/, "Lowercase, no spaces"),
  isActive: z.boolean(),
});

export type ShippingCarrierFormValues = z.infer<typeof ShippingCarrierSchema>;
