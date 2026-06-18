// features/subscriptions/schema/subscription.schema.ts
import { z } from "zod";

export const InitiateTopupSchema = z
  .object({
    credits: z.number().default(0),
  })
  .refine((data) => data.credits > 0, {
    message: "Please select a credit bundle",
    path: ["credits"],
  });

export type InitiateTopupValues = z.infer<typeof InitiateTopupSchema>;
