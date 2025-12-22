import { z } from "zod";

export const userInviteSchema = z.object({
  name: z.string().min(1, "First name is required"),
  email: z.email("Enter a valid email"),
  companyRoleId: z.string().min(1, "Role is required"),
});

export type UserInviteValues = z.infer<typeof userInviteSchema>;
