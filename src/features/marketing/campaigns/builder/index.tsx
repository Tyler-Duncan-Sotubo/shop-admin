// features/campaigns/builder/index.tsx
"use client";

import { Form } from "@/shared/ui/form";
import { Button } from "@/shared/ui/button";
import { BackButton } from "@/shared/ui/back-button";
import PageHeader from "@/shared/ui/page-header";
import { useCampaignBuilder } from "./hooks/use-campaign-builder";
import { StepIndicator } from "./steps/step-indicator";
import { StepTemplate } from "./steps/step-template";
import { StepContent } from "./steps/step-content";
import { StepPreview } from "./steps/step-preview";
import { StepAudience } from "./steps/step-audience";
import { StepSend } from "./steps/step-send";
import { CampaignBuilderValues } from "../schema/campaign.schema";
import { CampaignPreview } from "../ui/campaign-preview";

export function CampaignBuilder() {
  const {
    form,
    watchedValues,
    templateType,
    audienceType,
    audienceCount,
    step,
    next,
    back,
    canProceed,
    saveDraft,
    handleSendTest,
    handleSendNow,
    testEmail,
    setTestEmail,
    isSubmitting,
    submitError,
    createCampaign,
    sendTest,
    emailConfig,
  } = useCampaignBuilder();

  return (
    <div className="space-y-6">
      <BackButton href="/marketing/campaigns" label="Back to campaigns" />

      <PageHeader
        title="New Campaign"
        description="Build and send your email campaign."
      >
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
                      onClick={saveDraft}
                      disabled={isSubmitting || !watchedValues.subject}
                      isLoading={createCampaign.isPending}
                    >
                      Save draft
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
                    Select a template to see a preview of your campaign.
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
