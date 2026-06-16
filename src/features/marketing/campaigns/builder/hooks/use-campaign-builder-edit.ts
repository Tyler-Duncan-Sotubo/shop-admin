/* eslint-disable @typescript-eslint/no-explicit-any */
// features/campaigns/builder/hooks/use-campaign-builder-edit.ts
"use client";

import { useState, useEffect } from "react";
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
  useGetCampaign,
  useUpdateCampaign,
  useSendCampaign,
  useSendTestCampaign,
  useAudienceCount,
} from "../../hooks/use-campaigns";
import { buildContentJson } from "../utils/build-content-json";
import type { Step } from "../types/builder.types";
import type { TemplateType } from "../../types/campaign.types";
import { nanoid } from "nanoid";
import { useGetEmailSenderConfig } from "@/features/settings/email-config/hooks/use-email-sender-config";

export function useCampaignBuilderEdit(campaignId: string) {
  const router = useRouter();
  const { data: session } = useSession();
  const axios = useAxiosAuth();
  const { activeStoreId } = useStoreScope();

  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState("");

  const updateCampaign = useUpdateCampaign(session, axios);
  const sendCampaign = useSendCampaign(session, axios);
  const sendTest = useSendTestCampaign(session, axios);

  const { data: emailConfig } = useGetEmailSenderConfig(session, axios);
  const { data: campaign, isLoading } = useGetCampaign(
    session,
    axios,
    campaignId,
  );

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

  // ── Populate form when campaign loads ────────────────────
  useEffect(() => {
    if (!campaign) return;

    let blocks: CampaignBuilderValues["blocks"] = [];
    try {
      if (campaign.contentJson) {
        const parsed = JSON.parse(campaign.contentJson);
        blocks = (parsed.blocks ?? []).map((b: any) => ({
          id: nanoid(),
          imageUrl: b.imageUrl ?? "",
          linkUrl: b.linkUrl ?? null,
          width: b.width ?? "full",
        }));
      }
    } catch {
      blocks = [];
    }

    form.reset({
      templateType: campaign.templateType,
      audienceType: campaign.audienceType,
      subject: campaign.subject ?? "",
      previewText: campaign.previewText ?? "",
      blocks,
    } as CampaignBuilderValues);
  }, [campaign, form]);

  const watchedValues = useWatch({ control: form.control });
  const templateType = watchedValues.templateType as TemplateType | undefined;
  const audienceType = watchedValues.audienceType ?? "all";

  const { data: audienceCount } = useAudienceCount(session, axios, {
    storeId: activeStoreId ?? "",
    audienceType,
  });

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

  // ── Save changes ─────────────────────────────────────────
  const saveChanges = async () => {
    const values = form.getValues();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await updateCampaign.mutateAsync({
        id: campaignId,
        templateType: values.templateType,
        audienceType: values.audienceType,
        subject: values.subject,
        previewText: values.previewText ?? null,
        contentJson: buildContentJson(values),
      });
      toast.success("Changes saved");
      return campaignId;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save changes";
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

    // save latest changes first so test reflects current state
    await saveChanges();

    try {
      await sendTest.mutateAsync({ id: campaignId, toEmail: testEmail });
      toast.success(`Test email sent to ${testEmail}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send test");
    }
  };

  // ── Send now ─────────────────────────────────────────────
  const handleSendNow = async () => {
    await saveChanges();

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
  };
}
