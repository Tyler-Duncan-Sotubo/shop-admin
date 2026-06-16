// features/campaigns/components/template-fields.tsx
"use client";

import type { UseFormReturn } from "react-hook-form";
import type { CampaignBuilderValues } from "../schema/campaign.schema";
import { NewsletterFields } from "./newsletter-fields";

// import { NewArrivalFields } from "./fields/new-arrival-fields";
// import { PromotionFields }  from "./fields/promotion-fields";

type Props = {
  form: UseFormReturn<CampaignBuilderValues>;
};

export function TemplateFields({ form }: Props) {
  const templateType = form.watch("templateType");

  switch (templateType) {
    case "newsletter":
      return <NewsletterFields form={form} />;

    // case "new_arrival":
    //   return <NewArrivalFields form={form} />;

    // case "promotion":
    //   return <PromotionFields form={form} />;

    default:
      return null;
  }
}
