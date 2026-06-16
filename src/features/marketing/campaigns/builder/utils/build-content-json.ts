import type { CampaignBuilderValues } from "../../schema/campaign.schema";

export function buildContentJson(values: CampaignBuilderValues): string {
  return JSON.stringify({
    blocks: values.blocks.map((b, i) => ({
      id: b.id ?? `block-${i}`, // ← always save id
      imageUrl: b.imageUrl,
      linkUrl: b.linkUrl ?? null,
      width: b.width,
    })),
  });
}
