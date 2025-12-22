import { z } from "zod";

export const loginSchema = z.object({
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  email: z.email({
    message: "Please enter a valid email address.",
  }),
});
