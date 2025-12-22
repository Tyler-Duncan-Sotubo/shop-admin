import { z } from "zod";

export const VerifyEmailFormSchema = z.object({
  token: z.string().length(6, "OTP must be exactly 6 digits"),
});

export type VerifyEmailFormValues = z.infer<typeof VerifyEmailFormSchema>;
