import { z } from "zod";

const HOST_REGEX =
  /^(?=.{1,253}$)(?!-)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

export const SetupDomainSchema = z.object({
  domain: z
    .string()
    .min(1, "Domain is required")
    .max(255)
    .regex(
      HOST_REGEX,
      'Use a valid host like "example.com" (no http/https, no path)'
    ),
  isPrimary: z.boolean().optional(),
});

export const SetupStoreSchema = z.object({
  name: z.string().min(1, "Store name is required").max(120),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(80)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must be lowercase and hyphenated (e.g. "my-store")'
    ),
  defaultCurrency: z.enum(["NGN"]).optional(),
  defaultLocale: z.enum(["en-NG", "en-US"]).optional(),
  isActive: z.boolean().optional(),
  domains: z
    .array(SetupDomainSchema)
    .min(1, "At least one domain is required")
    .superRefine((domains, ctx) => {
      const primaries = domains.filter((d) => d.isPrimary).length;
      if (primaries > 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Only one primary domain is allowed.",
          path: ["domains"],
        });
      }
    }),
  companySize: z.enum(["solo", "2-10", "11-50", "51-200", "200+"]).optional(),
  industry: z.string().min(2).max(64).optional(),
  useCase: z
    .enum(["online-store", "catalog", "booking", "subscriptions"])
    .optional(),
  supportedCurrencies: z.array(z.enum(["GBP", "USD", "CAD"])).optional(),
});

export type SetupStoreFormValues = z.infer<typeof SetupStoreSchema>;
