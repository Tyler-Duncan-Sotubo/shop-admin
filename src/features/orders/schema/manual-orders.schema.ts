import z from "zod";

export const ManualOrderSchema = z.object({
  storeId: z.uuid().nullable().optional(), // injected from scope
  currency: z.string().min(1, "Currency is required"),
  originInventoryLocationId: z.string("Origin inventory location is required"),
  channel: z.enum(["manual", "pos"]).optional(),
  customerId: z.uuid().nullable().optional(),
  shippingAddress: z.record(z.string(), z.any()).nullable().optional(),
  billingAddress: z.record(z.string(), z.any()).nullable().optional(),
});

export type ManualOrderFormValues = z.infer<typeof ManualOrderSchema>;
