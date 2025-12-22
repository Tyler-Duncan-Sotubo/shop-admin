import z from "zod";

export const newPasswordSchema = z
  .object({
    password: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    password_confirmation: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords must match.",
    path: ["password_confirmation"],
  });

export type newPasswordValues = z.infer<typeof newPasswordSchema>;
