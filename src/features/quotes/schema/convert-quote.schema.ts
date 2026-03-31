import z from "zod";

export const ConvertQuoteSchema = z.object({
  channel: z.enum(["manual", "pos"]),
  currency: z.string().min(1, "Currency is required"),
  originInventoryLocationId: z.string(),
  fulfillmentModel: z.enum(["payment_first", "stock_first"]),
  customerId: z.string().nullable().optional(),
  shippingAddress: z.any().nullable().optional(),
  billingAddress: z.any().nullable().optional(),
  skipDraft: z.boolean(),
});

export type ConvertQuoteFormValues = z.infer<typeof ConvertQuoteSchema>;
