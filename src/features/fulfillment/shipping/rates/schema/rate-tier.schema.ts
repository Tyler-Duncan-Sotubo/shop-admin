import { z } from "zod";

export const RateTierSchema = z
  .object({
    id: z.string().optional(),
    rateId: z.string().min(1),

    minWeightGrams: z.transform(Number).pipe(z.number()),
    maxWeightGrams: z.transform(Number).pipe(z.number()),

    amount: z.string().min(1, "Amount is required"),
    priority: z.transform(Number).pipe(z.number()),
  })
  .refine((v) => v.minWeightGrams <= v.maxWeightGrams, {
    message: "Min weight cannot be greater than max weight",
    path: ["maxWeightGrams"],
  });

export type RateTierValues = z.infer<typeof RateTierSchema>;
