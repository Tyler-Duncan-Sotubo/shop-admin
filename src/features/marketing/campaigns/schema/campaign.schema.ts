// features/campaigns/schema/campaign.schema.ts
import { z } from "zod";

const AUDIENCE_TYPES = ["all", "customers", "subscribers"] as const;
export const TEMPLATE_TYPES = ["newsletter"] as const;

export const BlockSchema = z.object({
  id: z.string(), // local id for react key / reordering
  imageUrl: z.string().min(1, "Image is required"),
  linkUrl: z.string().optional().nullable(),
  width: z.enum(["full", "half"]),
});

export const CampaignBuilderSchema = z.object({
  templateType: z
    .enum(TEMPLATE_TYPES)
    .refine((val) => val, { message: "Please select a template" }),
  audienceType: z.enum(AUDIENCE_TYPES),
  subject: z.string().min(1, "Subject is required"),
  previewText: z.string().optional().nullable(),
  blocks: z.array(BlockSchema).min(1, "Add at least one image block"),
});

export type Block = z.infer<typeof BlockSchema>;
export type CampaignBuilderValues = z.infer<typeof CampaignBuilderSchema>;
