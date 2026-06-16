// features/campaigns/components/campaign-detail-client.tsx
"use client";

import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import Loading from "@/shared/ui/loading";
import PageHeader from "@/shared/ui/page-header";
import { BackButton } from "@/shared/ui/back-button";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { SectionHeading } from "@/shared/ui/section-heading";
import { format, parseISO, isValid } from "date-fns";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useGetCampaign,
  useSendCampaign,
  useSendTestCampaign,
  useDeleteCampaign,
} from "../hooks/use-campaigns";
import { CampaignPreview } from "./campaign-preview";
import { Input } from "@/shared/ui/input";
import type { CampaignBuilderValues } from "../schema/campaign.schema";
import type { CampaignStatus } from "../types/campaign.types";
import { DeleteCampaignAlert } from "./delete-campaign-alert";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

const STATUS_VARIANT: Record<CampaignStatus, Any> = {
  draft: "clean",
  scheduled: "clean",
  sending: "clean",
  sent: "success",
  failed: "destructive",
};

const AUDIENCE_LABEL: Record<string, string> = {
  all: "Everyone (customers + subscribers)",
  customers: "Customers only",
  subscribers: "Subscribers only",
};

type Props = {
  campaignId: string;
};

export default function CampaignDetailClient({ campaignId }: Props) {
  const axios = useAxiosAuth();
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [testEmail, setTestEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    data: campaign,
    isLoading,
    isError,
    error,
  } = useGetCampaign(session, axios, campaignId);

  const sendCampaign = useSendCampaign(session, axios);
  const sendTest = useSendTestCampaign(session, axios);
  const deleteCampaign = useDeleteCampaign(session, axios);

  if (isLoading || authStatus === "loading") return <Loading />;

  if (isError || !campaign) {
    return (
      <div className="p-4 text-sm text-destructive">
        Error loading campaign: {(error as Error)?.message ?? "Unknown error"}
      </div>
    );
  }

  // ── Parse contentJson for preview ───────────────────────
  let parsedContent: Partial<CampaignBuilderValues> = {};
  try {
    if (campaign.contentJson) {
      parsedContent = JSON.parse(campaign.contentJson);
    }
  } catch {
    parsedContent = {};
  }

  const isDraft = campaign.status === "draft";
  const isSent = campaign.status === "sent";
  const canSend =
    campaign.status === "draft" || campaign.status === "scheduled";

  const formattedDate = (iso: string | null) => {
    if (!iso) return "—";
    const d = parseISO(iso);
    return isValid(d) ? format(d, "MMM d, yyyy · h:mm a") : iso;
  };

  // ── Send now ─────────────────────────────────────────────
  const handleSendNow = async () => {
    setIsSending(true);
    try {
      const result = await sendCampaign.mutateAsync(campaign.id);
      toast.success(
        `Campaign sent to ${result.sentCount.toLocaleString()} recipients`,
      );
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to send campaign",
      );
    } finally {
      setIsSending(false);
    }
  };

  // ── Send test ────────────────────────────────────────────
  const handleSendTest = async () => {
    if (!testEmail) return;
    try {
      await sendTest.mutateAsync({ id: campaign.id, toEmail: testEmail });
      toast.success(`Test email sent to ${testEmail}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to send test");
    }
  };

  // ── Delete ───────────────────────────────────────────────
  // features/campaigns/components/campaign-detail-client.tsx
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCampaign.mutateAsync(campaign.id);
      toast.success("Campaign deleted");
      router.push("/marketing/campaigns"); // ← this unmounts the component
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete campaign",
      );
      setIsDeleting(false); // ← only reset if it fails
    }
  };

  return (
    <section className="space-y-4">
      <BackButton href="/marketing/campaigns" label="Back to campaigns" />

      <PageHeader
        title={campaign.subject}
        description={`Created ${formattedDate(campaign.createdAt)}`}
      >
        <Badge variant={STATUS_VARIANT[campaign.status]}>
          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
        </Badge>

        {isDraft && (
          <Button
            variant="outline"
            onClick={() =>
              router.push(`/marketing/campaigns/${campaign.id}/edit`)
            }
          >
            Edit
          </Button>
        )}

        {canSend && (
          <Button
            onClick={handleSendNow}
            disabled={isSending}
            isLoading={isSending}
          >
            {isSending ? "Sending..." : "Send now"}
          </Button>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ── LEFT — details + stats + actions ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Campaign details */}
          <div className="rounded-lg border p-5 space-y-4">
            <SectionHeading>Campaign details</SectionHeading>
            <div className="divide-y text-sm">
              <div className="flex justify-between py-2.5">
                <span className="text-muted-foreground">Subject</span>
                <span className="font-medium">{campaign.subject}</span>
              </div>
              {campaign.previewText && (
                <div className="flex justify-between py-2.5">
                  <span className="text-muted-foreground">Preview text</span>
                  <span className="font-medium text-right max-w-xs">
                    {campaign.previewText}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-2.5">
                <span className="text-muted-foreground">Audience</span>
                <span className="font-medium">
                  {AUDIENCE_LABEL[campaign.audienceType] ??
                    campaign.audienceType}
                </span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={STATUS_VARIANT[campaign.status]}>
                  {campaign.status.charAt(0).toUpperCase() +
                    campaign.status.slice(1)}
                </Badge>
              </div>
              {campaign.scheduledAt && (
                <div className="flex justify-between py-2.5">
                  <span className="text-muted-foreground">Scheduled for</span>
                  <span className="font-medium">
                    {formattedDate(campaign.scheduledAt)}
                  </span>
                </div>
              )}
              {campaign.sentAt && (
                <div className="flex justify-between py-2.5">
                  <span className="text-muted-foreground">Sent at</span>
                  <span className="font-medium">
                    {formattedDate(campaign.sentAt)}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-2.5">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">
                  {formattedDate(campaign.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Stats — only show if sent */}
          {isSent && (
            <div className="rounded-lg border p-5 space-y-4">
              <SectionHeading>Campaign stats</SectionHeading>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard
                  label="Sent"
                  value={campaign.sentCount.toLocaleString()}
                />
                <StatCard
                  label="Open rate"
                  value={
                    campaign.sentCount > 0
                      ? `${Math.round((campaign.openCount / campaign.sentCount) * 100)}%`
                      : "—"
                  }
                  sub={`${campaign.openCount.toLocaleString()} opens`}
                />
                <StatCard
                  label="Click rate"
                  value={
                    campaign.sentCount > 0
                      ? `${Math.round((campaign.clickCount / campaign.sentCount) * 100)}%`
                      : "—"
                  }
                  sub={`${campaign.clickCount.toLocaleString()} clicks`}
                />
                <StatCard
                  label="Unsubscribed"
                  value={campaign.unsubscribeCount.toLocaleString()}
                  sub={
                    campaign.sentCount > 0
                      ? `${Math.round((campaign.unsubscribeCount / campaign.sentCount) * 100)}%`
                      : undefined
                  }
                />
              </div>
            </div>
          )}

          {/* Send test — only for draft/scheduled */}
          {canSend && (
            <div className="rounded-lg border p-5 space-y-4">
              <SectionHeading>Send test email</SectionHeading>
              <p className="text-sm text-muted-foreground">
                Send a preview to yourself before sending to your full audience.
              </p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSendTest}
                  disabled={!testEmail || sendTest.isPending}
                  isLoading={sendTest.isPending}
                >
                  Send test
                </Button>
              </div>
            </div>
          )}

          {/* Danger zone — only for drafts */}

          {isDraft && (
            <div className="rounded-lg border border-destructive/30 p-5 space-y-3">
              <SectionHeading>Danger zone</SectionHeading>
              <p className="text-sm text-muted-foreground">
                Permanently delete this draft campaign. This cannot be undone.
              </p>
              <DeleteCampaignAlert
                onConfirm={handleDelete}
                isLoading={isDeleting}
              />
            </div>
          )}
        </div>

        {/* ── RIGHT — preview ── */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-lg border p-4 space-y-3 sticky top-6">
            <p className="text-sm font-medium">Email preview</p>
            <CampaignPreview
              values={parsedContent}
              fromName="Your Store"
              brandColor="#D4A017"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Stat card ────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-lg bg-muted/40 p-4 space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
