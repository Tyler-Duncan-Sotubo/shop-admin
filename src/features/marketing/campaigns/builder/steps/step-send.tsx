/* eslint-disable @typescript-eslint/no-explicit-any */
// features/campaigns/builder/steps/step-send.tsx
"use client";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { SectionHeading } from "@/shared/ui/section-heading";
import type { TemplateType } from "../../types/campaign.types";
import type { UseMutationResult } from "@tanstack/react-query";

type Props = {
  templateType: TemplateType | undefined;
  subject: string | undefined;
  audienceType: string;
  audienceCount: number | undefined;
  testEmail: string;
  onTestEmailChange: (email: string) => void;
  onSendTest: () => void;
  onSendNow: () => void;
  isSubmitting: boolean;
  submitError: string | null;
  sendTestMutation: UseMutationResult<any, any, any, any>;
};

export function StepSend({
  templateType,
  subject,
  audienceType,
  audienceCount,
  testEmail,
  onTestEmailChange,
  onSendTest,
  onSendNow,
  isSubmitting,
  submitError,
  sendTestMutation,
}: Props) {
  return (
    <div className="space-y-6">
      {/* Send test */}
      <div className="rounded-lg border p-6 space-y-4">
        <SectionHeading>Send test email</SectionHeading>
        <p className="text-sm text-muted-foreground">
          Send a preview to yourself before sending to your audience.
        </p>
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="your@email.com"
            value={testEmail}
            onChange={(e) => onTestEmailChange(e.target.value)}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={onSendTest}
            disabled={!testEmail || sendTestMutation.isPending}
            isLoading={sendTestMutation.isPending}
          >
            Send test
          </Button>
        </div>
      </div>

      {/* Summary + send */}
      <div className="rounded-lg border p-6 space-y-4">
        <SectionHeading>Ready to send</SectionHeading>

        <div className="divide-y">
          <div className="flex justify-between py-2.5 text-sm">
            <span className="text-muted-foreground">Template</span>
            <span className="font-medium capitalize">
              {templateType?.replace("_", " ")}
            </span>
          </div>
          <div className="flex justify-between py-2.5 text-sm">
            <span className="text-muted-foreground">Subject</span>
            <span className="font-medium text-right max-w-xs truncate">
              {subject}
            </span>
          </div>
          <div className="flex justify-between py-2.5 text-sm">
            <span className="text-muted-foreground">Audience</span>
            <span className="font-medium capitalize">
              {audienceType === "all" ? "Everyone" : audienceType}
            </span>
          </div>
          <div className="flex justify-between py-2.5 text-sm">
            <span className="text-muted-foreground">Recipients</span>
            <span className="font-medium">
              {audienceCount?.toLocaleString() ?? "—"}
            </span>
          </div>
          <div className="flex justify-between py-2.5 text-sm">
            <span className="text-muted-foreground">Credits needed</span>
            <span className="font-medium">
              {audienceCount?.toLocaleString() ?? "—"}
            </span>
          </div>
        </div>

        {submitError && (
          <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            {submitError}
          </div>
        )}

        <Button
          type="button"
          className="w-full"
          size="lg"
          onClick={onSendNow}
          disabled={isSubmitting || audienceCount === 0}
          isLoading={isSubmitting}
        >
          {isSubmitting
            ? "Sending..."
            : `Send to ${audienceCount?.toLocaleString() ?? "—"} recipients`}
        </Button>

        {audienceCount === 0 && (
          <p className="text-xs text-center text-muted-foreground">
            You need at least 1 recipient to send.
          </p>
        )}
      </div>
    </div>
  );
}
