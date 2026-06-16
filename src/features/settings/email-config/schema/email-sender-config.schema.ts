// features/email-marketing/schema/email-sender-config.schema.ts
import { z } from "zod";

export const EmailSenderConfigSchema = z.object({
  fromEmail: z.string().email("Must be a valid email"),
  fromName: z.string().min(1, "Display name is required"),
  logoUrl: z.string().optional().nullable(),
  brandColor: z
    .string()
    .regex(/^#([0-9A-Fa-f]{6})$/, "Must be a valid hex colour e.g. #D4A017")
    .optional()
    .nullable(),
  companyAddress: z.string().optional().nullable(),
  footerTagline: z.string().optional().nullable(),
  // social links stored as individual fields, serialised to JSON on save
  twitter: z.string().optional().nullable(),
  facebook: z.string().optional().nullable(),
  instagram: z.string().optional().nullable(),
  youtube: z.string().optional().nullable(),
});

export type EmailSenderConfigValues = z.infer<typeof EmailSenderConfigSchema>;
