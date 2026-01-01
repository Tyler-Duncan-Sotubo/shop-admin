import z from "zod";

export const ConvertQuoteSchema = z.object({
  channel: z.enum(["manual", "pos"]),
  currency: z.string().min(1, "Currency is required"),
  originInventoryLocationId: z.string(),
  customerId: z.string().nullable().optional(),
  shippingAddress: z.any().nullable().optional(),
  billingAddress: z.any().nullable().optional(),
});

export type ConvertQuoteFormValues = z.infer<typeof ConvertQuoteSchema>;
