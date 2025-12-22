import { z } from "zod";

export const RateSchema = z.object({
  id: z.string().optional(),
  zoneId: z.string().min(1, "Zone is required"),
  carrierId: z.string().nullable().optional(),
  name: z.string().min(1, "Name is required"),
  calc: z.enum(["flat", "weight"]),
  flatAmount: z.string().optional().nullable(),
  isDefault: z.boolean(),
  isActive: z.boolean(),
  priority: z.transform(Number).pipe(z.number()),
  minDeliveryDays: z.transform(Number).pipe(z.number()),
  maxDeliveryDays: z.transform(Number).pipe(z.number()),
});

export type RateValues = z.infer<typeof RateSchema>;
