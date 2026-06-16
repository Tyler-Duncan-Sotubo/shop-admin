// features/campaigns/builder/hooks/use-campaign-builder.ts
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import {
  CampaignBuilderSchema,
  type CampaignBuilderValues,
} from "../../schema/campaign.schema";
import {
  useCreateCampaign,
  useSendCampaign,
  useSendTestCampaign,
  useAudienceCount,
} from "../../hooks/use-campaigns";
import { buildContentJson } from "../utils/build-content-json";
import type { Step } from "../types/builder.types";
import type { TemplateType } from "../../types/campaign.types";
import { useGetEmailSenderConfig } from "@/features/settings/email-config/hooks/use-email-sender-config";

export function useCampaignBuilder() {
  const router = useRouter();
  const { data: session } = useSession();
  const axios = useAxiosAuth();
  const { activeStoreId } = useStoreScope();

  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const [createdCampaignId, setCreatedCampaignId] = useState<string | null>(
    null,
  );

  const createCampaign = useCreateCampaign(session, axios);
  const sendCampaign = useSendCampaign(session, axios);
  const sendTest = useSendTestCampaign(session, axios);

  const { data: emailConfig } = useGetEmailSenderConfig(session, axios);

  const form = useForm<CampaignBuilderValues>({
    resolver: zodResolver(CampaignBuilderSchema),
    defaultValues: {
      audienceType: "all",
      subject: "",
      previewText: "",
      blocks: [],
    },
    mode: "onSubmit",
  });

  const watchedValues = useWatch({ control: form.control });
  const templateType = watchedValues.templateType as TemplateType | undefined;
  const audienceType = watchedValues.audienceType ?? "all";

  const { data: audienceCount } = useAudienceCount(session, axios, {
    storeId: activeStoreId ?? "",
    audienceType,
  });

  // ── Parsed email config ──────────────────────────────────
  const parsedEmailConfig = {
    fromName: emailConfig?.fromName ?? "Your Store",
    logoUrl: emailConfig?.logoUrl ?? null,
    brandColor: emailConfig?.brandColor ?? "#111111",
    socialLinks: emailConfig?.socialLinks
      ? (() => {
          try {
            return JSON.parse(emailConfig.socialLinks!);
          } catch {
            return null;
          }
        })()
      : null,
  };

  // ── Step navigation ──────────────────────────────────────
  const canProceed = () => {
    if (step === 1) return !!templateType;
    if (step === 2) {
      return !!watchedValues.subject && (watchedValues.blocks?.length ?? 0) > 0;
    }
    return true;
  };

  const next = () => {
    if (canProceed()) setStep((s) => Math.min(s + 1, 5) as Step);
  };

  const back = () => setStep((s) => Math.max(s - 1, 1) as Step);

  // ── Save draft ───────────────────────────────────────────
  const saveDraft = async () => {
    const values = form.getValues();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        storeId: activeStoreId ?? "",
        templateType: values.templateType!,
        audienceType: values.audienceType,
        subject: values.subject,
        previewText: values.previewText ?? null,
        contentJson: buildContentJson(values),
      };

      const created = await createCampaign.mutateAsync(payload);
      setCreatedCampaignId(created.id);
      toast.success("Draft saved");
      return created.id;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save draft";
      setSubmitError(msg);
      toast.error(msg);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Send test ────────────────────────────────────────────
  const handleSendTest = async () => {
    if (!testEmail) return;
    let campaignId = createdCampaignId;
    if (!campaignId) campaignId = await saveDraft();
    if (!campaignId) return;

    try {
      await sendTest.mutateAsync({ id: campaignId, toEmail: testEmail });
      toast.success(`Test email sent to ${testEmail}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send test");
    }
  };

  // ── Send now ─────────────────────────────────────────────
  const handleSendNow = async () => {
    let campaignId = createdCampaignId;
    if (!campaignId) campaignId = await saveDraft();
    if (!campaignId) return;

    setIsSubmitting(true);
    try {
      const result = await sendCampaign.mutateAsync(campaignId);
      toast.success(
        `Campaign sent to ${result.sentCount.toLocaleString()} recipients`,
      );
      router.push("/marketing/campaigns");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to send campaign";
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    watchedValues,
    templateType,
    audienceType,
    audienceCount,
    emailConfig: parsedEmailConfig,
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
    sendCampaign,
  };
}
