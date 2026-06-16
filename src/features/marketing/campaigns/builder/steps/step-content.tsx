// features/campaigns/builder/steps/step-content.tsx
"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { SectionHeading } from "@/shared/ui/section-heading";
import type { UseFormReturn } from "react-hook-form";
import type { CampaignBuilderValues } from "../../schema/campaign.schema";
import { BlockBuilder } from "../ui/block-builder";

type Props = {
  form: UseFormReturn<CampaignBuilderValues>;
};

export function StepContent({ form }: Props) {
  return (
    <div className="space-y-6">
      {/* Email metadata */}
      <div className="rounded-lg border p-6 space-y-4">
        <SectionHeading>Email details</SectionHeading>

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject line</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. New arrivals just dropped 🔥"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="previewText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preview text</FormLabel>
              <FormControl>
                <Input
                  placeholder="Short preview shown in inbox (optional)"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Block builder */}
      <div className="rounded-lg border p-6 space-y-4">
        <SectionHeading>Email content</SectionHeading>
        <p className="text-sm text-muted-foreground">
          Add image blocks to build your email. Design your images in Canva then
          upload them here.
        </p>
        <BlockBuilder form={form} />
      </div>
    </div>
  );
}
