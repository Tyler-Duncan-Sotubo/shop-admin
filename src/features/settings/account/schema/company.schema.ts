import z from "zod";

export const CompanyAccountSchema = z.object({
  name: z.string().min(1), // read-only in UI, but we still use it for defaults
  slug: z.string().min(1, "Slug is required"),
  legalName: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  vatNumber: z.string().optional().nullable(),
  defaultCurrency: z.string().min(1, "Default currency is required"),
  timezone: z.string().min(1, "Timezone is required"),
  defaultLocale: z.string().min(1, "Default locale is required"),
  billingEmail: z
    .email("Invalid email")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  plan: z.string().min(1),
});

export type CompanyAccountValues = z.infer<typeof CompanyAccountSchema>;
