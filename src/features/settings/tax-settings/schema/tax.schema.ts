import z from "zod";

export const TaxSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required").max(64, "Max 64 characters"),
  code: z.string().max(32, "Max 32 characters").nullable().optional(),
  ratePercent: z.transform(Number).pipe(z.number()),
  isInclusive: z.boolean(),
  isDefault: z.boolean(),
  isActive: z.boolean(),
});

export type TaxValues = z.infer<typeof TaxSchema>;

// helpers
export const percentToBps = (pct: number) => Math.round((pct ?? 0) * 100);
export const bpsToPercent = (bps: number) => Number(bps ?? 0) / 100;
