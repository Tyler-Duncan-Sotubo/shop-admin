import z from "zod";

export const Schema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  priority: z.transform(Number).pipe(z.number()),
  isActive: z.boolean(),
});

export type Values = z.infer<typeof Schema>;
