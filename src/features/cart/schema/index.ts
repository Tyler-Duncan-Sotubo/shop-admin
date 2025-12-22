import z from "zod";

export const Schema = z.object({
  customerId: z.string().optional().nullable(),
  guestToken: z.string().optional().nullable(),
  currency: z.string(),
  originInventoryLocationId: z.string().optional().nullable(),
});

export type CreateCartValues = z.infer<typeof Schema>;
