import z from "zod";

export const ProfileSchema = z.object({
  avatar: z.string().optional(),
  first_name: z.string().min(2, "First name is required"),
  last_name: z.string().min(2, "Last name is required"),
  email: z.string().email("Enter a valid email").min(5, "Email is required"),
});

export type ProfileSchemaType = z.infer<typeof ProfileSchema>;
