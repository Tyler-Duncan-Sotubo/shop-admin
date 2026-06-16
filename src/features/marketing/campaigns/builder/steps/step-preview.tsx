// features/campaigns/builder/steps/step-preview.tsx
"use client";

import { SectionHeading } from "@/shared/ui/section-heading";
import type { CampaignBuilderValues } from "../../schema/campaign.schema";
import { CampaignPreview } from "../../ui/campaign-preview";

type Props = {
  values: Partial<CampaignBuilderValues>;
  fromName: string;
  brandColor?: string | null;
  logoUrl?: string | null;
};

export function StepPreview({ values, fromName, brandColor, logoUrl }: Props) {
  return (
    <div className="rounded-lg border p-6 space-y-4">
      <SectionHeading>Preview</SectionHeading>
      <p className="text-sm text-muted-foreground">
        This is how your email will look in your recipients&apos; inbox.
      </p>
      <CampaignPreview
        values={values}
        fromName={fromName}
        brandColor={brandColor}
        logoUrl={logoUrl}
      />
    </div>
  );
}
