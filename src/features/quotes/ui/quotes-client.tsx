// features/quotes/components/quotes-client.tsx
"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import PageHeader from "@/shared/ui/page-header";
import Loading from "@/shared/ui/loading";
import { EmptyState } from "@/shared/ui/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { TabLabel } from "@/shared/ui/tab-label";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import type { ListQuotesParams } from "../types/quote.type";
import { useGetQuotes } from "../hooks/use-quotes";
import { QuotesTable } from "./quotes-table";
import { useQuoteCountsForTabs } from "../hooks/use-quotes-count";

type QuoteTab = "all" | "new" | "in_progress" | "converted" | "archived";

const TAB_TO_STATUS: Record<QuoteTab, ListQuotesParams["status"]> = {
  all: undefined,
  new: "new",
  in_progress: "in_progress",
  converted: "converted",
  archived: "archived",
};

export default function QuotesClient() {
  const { data: session, status: authStatus } = useSession();
  const axios = useAxiosAuth();
  const { activeStoreId } = useStoreScope();

  const [tab, setTab] = useState<QuoteTab>("all");

  // ✅ counts for tabs
  const counts = useQuoteCountsForTabs(session, axios, activeStoreId);

  const params = useMemo<ListQuotesParams>(
    () => ({
      limit: 50,
      offset: 0,
      status: TAB_TO_STATUS[tab],
      storeId: activeStoreId || "",
      includeArchived: true,
    }),
    [tab, activeStoreId]
  );

  const { data, isLoading } = useGetQuotes(session, axios, params);
  const rows = data?.rows ?? [];
  const hasData = rows.length > 0;

  if (authStatus === "loading" || isLoading) return <Loading />;

  return (
    <section className="space-y-6">
      <PageHeader
        title="Quote Requests"
        description="View and manage customer quote requests."
        tooltip="New = just submitted. In progress = being handled. Converted = turned into an order/invoice. Archived = hidden from active work."
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as QuoteTab)}>
        <TabsList>
          <TabsTrigger value="new">
            <TabLabel label="New" count={counts.new} />
          </TabsTrigger>

          <TabsTrigger value="in_progress">
            <TabLabel label="In progress" count={counts.inProgress} />
          </TabsTrigger>

          <TabsTrigger value="converted">
            <TabLabel
              label="Converted"
              count={counts.converted}
              showZero={false}
            />
          </TabsTrigger>

          <TabsTrigger value="archived">
            <TabLabel
              label="Archived"
              count={counts.archived}
              showZero={false}
            />
          </TabsTrigger>

          <TabsTrigger value="all">
            <TabLabel label="All" count={counts.all} />
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          {!hasData ? (
            <EmptyState
              title="No quote requests found"
              description="Try changing filters or search terms."
            />
          ) : (
            <QuotesTable data={rows} />
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
}
