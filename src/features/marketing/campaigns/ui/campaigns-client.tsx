// features/campaigns/components/campaigns-client.tsx
"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import PageHeader from "@/shared/ui/page-header";
import Loading from "@/shared/ui/loading";
import { DataTable } from "@/shared/ui/data-table";
import { FilterChips } from "@/shared/ui/filter-chips";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Plus } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import { useGetCampaigns } from "../hooks/use-campaigns";
import type { Campaign, CampaignStatus } from "../types/campaign.types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

type CampaignTab = "all" | CampaignStatus;

const VALID_TABS: CampaignTab[] = [
  "all",
  "draft",
  "scheduled",
  "sending",
  "sent",
  "failed",
];

function isValidTab(value: string | null): value is CampaignTab {
  return VALID_TABS.includes(value as CampaignTab);
}

const STATUS_VARIANT: Record<
  CampaignStatus,
  "success" | "destructive" | "clean" | Any
> = {
  draft: "clean",
  scheduled: "clean",
  sending: "clean",
  sent: "success",
  failed: "destructive",
};

const TEMPLATE_LABEL: Record<string, string> = {
  new_arrival: "New Arrival",
  promotion: "Promotion",
  newsletter: "Newsletter",
};

const AUDIENCE_LABEL: Record<string, string> = {
  all: "All",
  customers: "Customers",
  subscribers: "Subscribers",
};

const EMPTY_STATE: Record<CampaignTab, { title: string; description: string }> =
  {
    all: {
      title: "No campaigns yet",
      description: "Create your first email campaign to get started.",
    },
    draft: {
      title: "No draft campaigns",
      description: "Campaigns you're working on will appear here.",
    },
    scheduled: {
      title: "No scheduled campaigns",
      description: "Campaigns scheduled to send will appear here.",
    },
    sending: {
      title: "No campaigns sending",
      description: "Campaigns currently being sent will appear here.",
    },
    sent: {
      title: "No sent campaigns",
      description: "Campaigns that have been sent will appear here.",
    },
    failed: {
      title: "No failed campaigns",
      description: "Failed campaigns will appear here.",
    },
  };

const campaignColumns: ColumnDef<Campaign>[] = [
  {
    id: "subject",
    header: "Subject",
    cell: ({ row }) => {
      const c = row.original;
      return (
        <div className="space-y-0.5">
          <div className="font-medium">{c.subject}</div>
          <div className="text-xs text-muted-foreground">
            {TEMPLATE_LABEL[c.templateType] ?? c.templateType}
          </div>
        </div>
      );
    },
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge variant={STATUS_VARIANT[status]}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
  },
  {
    id: "audience",
    header: "Audience",
    cell: ({ row }) => (
      <span className="text-sm">
        {AUDIENCE_LABEL[row.original.audienceType] ?? row.original.audienceType}
      </span>
    ),
  },
  {
    id: "stats",
    header: "Stats",
    cell: ({ row }) => {
      const c = row.original;
      if (c.status !== "sent")
        return <span className="text-sm text-muted-foreground">—</span>;
      const openRate =
        c.sentCount > 0 ? Math.round((c.openCount / c.sentCount) * 100) : 0;
      const clickRate =
        c.sentCount > 0 ? Math.round((c.clickCount / c.sentCount) * 100) : 0;
      return (
        <div className="text-sm space-y-0.5">
          <div>{c.sentCount.toLocaleString()} sent</div>
          <div className="text-xs text-muted-foreground">
            {openRate}% open · {clickRate}% click
          </div>
        </div>
      );
    },
  },
  {
    id: "date",
    header: "Date",
    cell: ({ row }) => {
      const c = row.original;
      const iso = c.sentAt ?? c.scheduledAt ?? c.createdAt;
      if (!iso) return <span className="text-sm">—</span>;
      const date = parseISO(iso);
      return (
        <div className="text-sm space-y-0.5">
          <div>{isValid(date) ? format(date, "MMM d, yyyy") : iso}</div>
          <div className="text-xs text-muted-foreground">
            {c.sentAt ? "Sent" : c.scheduledAt ? "Scheduled" : "Created"}
          </div>
        </div>
      );
    },
  },
];

export default function CampaignsClient() {
  const { data: session, status: authStatus } = useSession();
  const axios = useAxiosAuth();
  const { activeStoreId } = useStoreScope();
  const router = useRouter();
  const searchParams = useSearchParams();

  const statusParam = searchParams.get("status");
  const tab: CampaignTab = isValidTab(statusParam) ? statusParam : "all";

  const setTab = (value: CampaignTab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("status", value);
    router.replace(`/marketing/campaigns?${params.toString()}`);
  };

  const params = useMemo(
    () => ({
      storeId: activeStoreId ?? "",
      status: tab === "all" ? undefined : (tab as CampaignStatus),
      limit: 50,
      offset: 0,
    }),
    [tab, activeStoreId],
  );

  const { data, isLoading } = useGetCampaigns(session, axios, params);

  if (authStatus === "loading") return <Loading />;

  const rows = data?.rows ?? [];
  const empty = EMPTY_STATE[tab];

  return (
    <section className="space-y-6">
      <PageHeader
        title="Campaigns"
        description="Create and manage your email campaigns."
        tooltip="Draft = in progress. Scheduled = queued to send. Sent = delivered to recipients."
      >
        <Button onClick={() => router.push("/marketing/campaigns/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Campaign
        </Button>
      </PageHeader>

      <DataTable
        columns={campaignColumns}
        data={isLoading ? [] : rows}
        filterKey="subject"
        filterPlaceholder="Search campaigns..."
        onRowClick={(campaign) =>
          router.push(`/marketing/campaigns/${campaign.id}`)
        }
        emptyState={{
          title: empty.title,
          description: empty.description,
          action: (
            <Button onClick={() => router.push("/marketing/campaigns/new")}>
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Button>
          ),
        }}
        toolbarLeft={
          <FilterChips<CampaignTab>
            value={tab}
            onChange={setTab}
            chips={[
              { value: "all", label: "All", count: data?.count },
              { value: "draft", label: "Draft", showZero: false },
              { value: "scheduled", label: "Scheduled", showZero: false },
              { value: "sent", label: "Sent", showZero: false },
              { value: "failed", label: "Failed", showZero: false },
            ]}
            wrap
          />
        }
      />
    </section>
  );
}
