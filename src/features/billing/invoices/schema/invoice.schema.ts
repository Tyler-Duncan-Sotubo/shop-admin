import z from "zod";

export const UpdateInvoiceLineSchema = z.object({
  description: z.string().min(1).max(255).optional(),
  quantity: z.number().int().min(1).optional(),

  // money are MINOR INTS
  unitPriceMinor: z.number().int().min(0).optional(),
  discountMinor: z.number().int().min(0).optional(),

  taxId: z.string().nullable().optional(),
  taxExempt: z.boolean().optional(),
  taxExemptReason: z.string().nullable().optional(),
});

export type UpdateInvoiceLineValues = z.infer<typeof UpdateInvoiceLineSchema>;

// helpers
export const minorToMajor = (minor: number) =>
  (Number(minor ?? 0) / 100).toFixed(2);
