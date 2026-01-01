import z from "zod";

export const recordPaymentSchema = z.object({
  method: z.enum(["bank_transfer", "cash", "card_manual", "other"]),
  amount: z.transform(Number).pipe(z.number()),
  currency: z
    .string()
    .min(3)
    .max(8)
    .transform((v) => v.toUpperCase()),
  reference: z.string().max(255).optional(),
  evidenceDataUrl: z.string().optional().nullable(),
  evidenceFileName: z.string().max(255).optional().nullable(),
  evidenceNote: z.string().max(255).optional(),
});

export type RecordPaymentValues = z.infer<typeof recordPaymentSchema>;
