import { z } from "zod";

export const RegisterSchema = z
  .object({
    password: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    passwordConfirmation: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    email: z.email({
      message: "Please enter a valid email address.",
    }),
    companyName: z.string().nonempty({}),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    terms: z.literal(true, {
      message: "You must accept the terms and conditions.",
    }),
    allowMarketingEmails: z.boolean().optional(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords must match.",
    path: ["passwordConfirmation"],
  });

export type RegisterValues = z.infer<typeof RegisterSchema>;
