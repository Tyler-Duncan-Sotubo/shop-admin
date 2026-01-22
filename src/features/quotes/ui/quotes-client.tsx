// features/quotes/components/quotes-client.tsx
"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import PageHeader from "@/shared/ui/page-header";
import Loading from "@/shared/ui/loading";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { TabLabel } from "@/shared/ui/tab-label";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import type { ListQuotesParams, Quote } from "../types/quote.type";
import { useGetQuotes } from "../hooks/use-quotes";
import { useQuoteCountsForTabs } from "../hooks/use-quotes-count";

import { DataTable } from "@/shared/ui/data-table";
import { quoteColumns } from "./quote-columns";

import { FilterChips, type FilterChip } from "@/shared/ui/filter-chips";
import { QuotesMobileRow } from "./quotes-mobile-row";

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

  const counts = useQuoteCountsForTabs(session, axios, activeStoreId);

  const params = useMemo<ListQuotesParams>(
    () => ({
      limit: 50,
      offset: 0,
      status: TAB_TO_STATUS[tab],
      storeId: activeStoreId || "",
      includeArchived: true,
    }),
    [tab, activeStoreId],
  );

  const { data, isLoading } = useGetQuotes(session, axios, params);

  if (authStatus === "loading") return <Loading />;

  const rows: Quote[] = data?.rows ?? [];

  const chips: FilterChip<QuoteTab>[] = [
    { value: "new", label: "New", count: counts.new },
    { value: "in_progress", label: "In progress", count: counts.inProgress },
    {
      value: "converted",
      label: "Converted",
      count: counts.converted,
      showZero: false,
    },
    {
      value: "archived",
      label: "Archived",
      count: counts.archived,
      showZero: false,
    },
    { value: "all", label: "All", count: counts.all },
  ];

  return (
    <section className="space-y-6">
      <PageHeader
        title="Quote Requests"
        description="View and manage customer quote requests."
        tooltip="New = just submitted. In progress = being handled. Converted = turned into an order/invoice. Archived = hidden from active work."
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as QuoteTab)}>
        <DataTable
          columns={quoteColumns}
          data={isLoading ? [] : rows}
          filterKey="customerEmail"
          filterPlaceholder="Search by email, id..."
          mobileRow={QuotesMobileRow}
          toolbarLeft={
            <>
              {/* ✅ Mobile: Filter chips */}
              <FilterChips<QuoteTab>
                value={tab}
                onChange={setTab}
                chips={chips}
                wrap
                // or: scrollable
              />

              {/* ✅ Desktop: Tabs */}
              <div className="hidden sm:block">
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
              </div>
            </>
          }
        />
      </Tabs>
    </section>
  );
}
