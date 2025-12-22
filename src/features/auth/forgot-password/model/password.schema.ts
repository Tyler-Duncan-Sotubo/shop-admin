import { z } from "zod";

export const requestPasswordResetSchema = z.object({
  email: z.email({
    message: "Please enter a valid email address.",
  }),
});

export type requestPasswordResetSchemaType = z.infer<
  typeof requestPasswordResetSchema
>;
