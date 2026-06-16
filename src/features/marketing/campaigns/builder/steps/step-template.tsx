// features/campaigns/builder/steps/step-template.tsx
"use client";

import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/shared/ui/form";
import { SectionHeading } from "@/shared/ui/section-heading";
import type { UseFormReturn } from "react-hook-form";
import type { CampaignBuilderValues } from "../../schema/campaign.schema";
import { TemplatePicker } from "../../ui/template-picker";

type Props = {
  form: UseFormReturn<CampaignBuilderValues>;
};

export function StepTemplate({ form }: Props) {
  return (
    <div className="rounded-lg border p-6 space-y-4">
      <SectionHeading>Choose a template</SectionHeading>
      <p className="text-sm text-muted-foreground">
        Pick a layout for your campaign. You can only change this before saving.
      </p>
      <FormField
        control={form.control}
        name="templateType"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <TemplatePicker
                value={field.value ?? null}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
