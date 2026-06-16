// features/campaigns/builder/campaign-builder-edit.tsx
"use client";

import { Form } from "@/shared/ui/form";
import { Button } from "@/shared/ui/button";
import { BackButton } from "@/shared/ui/back-button";
import PageHeader from "@/shared/ui/page-header";
import Loading from "@/shared/ui/loading";
import { useCampaignBuilderEdit } from "../hooks/use-campaign-builder-edit";
import { CampaignBuilderValues } from "../../schema/campaign.schema";
import { CampaignPreview } from "../../ui/campaign-preview";
import { StepAudience } from "../steps/step-audience";
import { StepContent } from "../steps/step-content";
import { StepIndicator } from "../steps/step-indicator";
import { StepPreview } from "../steps/step-preview";
import { StepSend } from "../steps/step-send";
import { StepTemplate } from "../steps/step-template";

type Props = {
  campaignId: string;
};

export function CampaignBuilderEdit({ campaignId }: Props) {
  const {
    form,
    watchedValues,
    templateType,
    audienceType,
    audienceCount,
    emailConfig,
    step,
    next,
    back,
    canProceed,
    saveChanges,
    handleSendTest,
    handleSendNow,
    testEmail,
    setTestEmail,
    isSubmitting,
    submitError,
    isLoading,
    campaign,
    updateCampaign,
    sendTest,
    sendCampaign,
  } = useCampaignBuilderEdit(campaignId);

  if (isLoading) return <Loading />;

  if (!campaign) {
    return (
      <div className="p-4 text-sm text-destructive">Campaign not found.</div>
    );
  }

  // Only draft campaigns can be edited
  if (campaign.status !== "draft") {
    return (
      <div className="space-y-4 p-4">
        <BackButton
          href={`/marketing/campaigns/${campaignId}`}
          label="Back to campaign"
        />
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          Only draft campaigns can be edited. This campaign has status:{" "}
          <strong>{campaign.status}</strong>.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BackButton
        href={`/marketing/campaigns/${campaignId}`}
        label="Back to campaign"
      />

      <PageHeader title="Edit Campaign" description={campaign.subject}>
        <StepIndicator step={step} />
      </PageHeader>

      <Form {...form}>
        <form className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* ── MAIN CONTENT ── */}
            <div className="lg:col-span-8 space-y-6">
              {step === 1 && <StepTemplate form={form} />}
              {step === 2 && <StepContent form={form} />}
              {step === 3 && (
                <StepPreview
                  values={watchedValues as CampaignBuilderValues}
                  fromName={emailConfig.fromName}
                  logoUrl={emailConfig.logoUrl}
                  brandColor={emailConfig.brandColor}
                />
              )}
              {step === 4 && (
                <StepAudience
                  form={form}
                  audienceType={audienceType}
                  audienceCount={audienceCount}
                />
              )}
              {step === 5 && (
                <StepSend
                  templateType={templateType}
                  subject={watchedValues.subject}
                  audienceType={audienceType}
                  audienceCount={audienceCount}
                  testEmail={testEmail}
                  onTestEmailChange={setTestEmail}
                  onSendTest={handleSendTest}
                  onSendNow={handleSendNow}
                  isSubmitting={isSubmitting}
                  submitError={submitError}
                  sendTestMutation={sendTest}
                />
              )}

              {/* ── Navigation ── */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={back}
                  disabled={step === 1}
                >
                  Back
                </Button>

                <div className="flex items-center gap-2">
                  {step >= 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={saveChanges}
                      disabled={isSubmitting || !watchedValues.subject}
                      isLoading={updateCampaign.isPending}
                    >
                      Save changes
                    </Button>
                  )}
                  {step < 5 && (
                    <Button
                      type="button"
                      onClick={next}
                      disabled={!canProceed()}
                    >
                      Continue
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* ── RIGHT SIDEBAR ── */}
            <div className="hidden lg:block lg:col-span-4 space-y-4">
              {step >= 2 && (
                <div className="rounded-lg border p-4 space-y-3 sticky top-6">
                  <p className="text-sm font-medium">Live preview</p>
                  <CampaignPreview
                    values={watchedValues as CampaignBuilderValues}
                    fromName={emailConfig.fromName}
                    logoUrl={emailConfig.logoUrl}
                    brandColor={emailConfig.brandColor}
                  />
                </div>
              )}
              {step === 1 && (
                <div className="rounded-lg border border-dashed p-6 text-center space-y-2 sticky top-6">
                  <p className="text-sm font-medium text-muted-foreground">
                    Live preview
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Select a template to see a preview.
                  </p>
                </div>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
