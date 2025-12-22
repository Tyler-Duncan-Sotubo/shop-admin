import z from "zod";

export const PickupLocationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  inventoryLocationId: z.string().nullable().optional(),
  isActive: z.boolean(),
  instructions: z.string().nullable().optional(),
  address1: z.string().min(1, "Pickup address is required"),
  address2: z.string().optional().nullable(),
  state: z.string().min(1, "State is required"),
});

export type PickupLocationValues = z.infer<typeof PickupLocationSchema>;
