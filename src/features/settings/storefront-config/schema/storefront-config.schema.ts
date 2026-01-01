import z from "zod";

const LinkSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
});

export const StorefrontConfigSchema = z.object({
  theme: z
    .object({
      logoUrl: z.string().optional(),
      colors: z
        .object({
          brand: z.string().optional(),
          background: z.string().optional(),
          text: z.string().optional(),
        })
        .optional(),
      button: z
        .object({
          radius: z.number().min(0).max(999).optional(),
          style: z.enum(["solid", "outline", "ghost"]).optional(),
        })
        .optional(),
    })
    .optional(),
  header: z
    .object({
      variant: z.enum(["leftLogo", "centerLogo"]).optional(),
      links: z.array(LinkSchema).optional(),
      showSearch: z.boolean().optional(),
      sticky: z.boolean().optional(),
    })
    .optional(),
  pages: z.record(z.string(), z.any()).optional(), // MVP: keep flexible; tighten later
});

export type StorefrontConfigValues = z.infer<typeof StorefrontConfigSchema>;
