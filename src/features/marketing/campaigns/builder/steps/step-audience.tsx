// features/campaigns/builder/steps/step-audience.tsx
"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { SectionHeading } from "@/shared/ui/section-heading";
import type { UseFormReturn } from "react-hook-form";
import type { CampaignBuilderValues } from "../../schema/campaign.schema";

type Props = {
  form: UseFormReturn<CampaignBuilderValues>;
  audienceType: string;
  audienceCount: number | undefined;
};

export function StepAudience({ form, audienceType, audienceCount }: Props) {
  return (
    <div className="rounded-lg border p-6 space-y-4">
      <SectionHeading>Choose audience</SectionHeading>

      <FormField
        control={form.control}
        name="audienceType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Send to</FormLabel>
            <FormControl>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    Everyone (customers + subscribers)
                  </SelectItem>
                  <SelectItem value="customers">
                    Customers only (marketing opt-in)
                  </SelectItem>
                  <SelectItem value="subscribers">Subscribers only</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {audienceCount !== undefined && audienceCount > 0 && (
        <div className="rounded-lg bg-muted/50 p-4 space-y-1">
          <p className="text-sm font-medium">
            {audienceCount.toLocaleString()} recipients
          </p>
          <p className="text-xs text-muted-foreground">
            Based on your current{" "}
            {audienceType === "all"
              ? "customers and subscribers"
              : audienceType}{" "}
            with marketing consent
          </p>
        </div>
      )}

      {audienceCount === 0 && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          No recipients found for this audience. Make sure you have subscribers
          or customers with marketing opt-in before sending.
        </div>
      )}
    </div>
  );
}
