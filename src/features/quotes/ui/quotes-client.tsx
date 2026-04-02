// features/quotes/components/quotes-client.tsx
"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { FilterChips } from "@/shared/ui/filter-chips";
import { QuotesMobileRow } from "./quotes-mobile-row";
import { Button } from "@/shared/ui/button";
import { Plus } from "lucide-react";
import { CreateQuoteModal } from "./create-quote-modal";

type QuoteTab = "all" | "new" | "in_progress" | "converted" | "archived";

const VALID_TABS: QuoteTab[] = [
  "all",
  "new",
  "in_progress",
  "converted",
  "archived",
];

function isValidTab(value: string | null): value is QuoteTab {
  return VALID_TABS.includes(value as QuoteTab);
}

const TAB_TO_STATUS: Record<QuoteTab, ListQuotesParams["status"]> = {
  all: undefined,
  new: "new",
  in_progress: "in_progress",
  converted: "converted",
  archived: "archived",
};

const EMPTY_STATE: Record<QuoteTab, { title: string; description: string }> = {
  new: {
    title: "No new quote requests",
    description: "New quote requests submitted by customers will appear here.",
  },
  in_progress: {
    title: "Nothing in progress",
    description: "Quotes you're actively working on will appear here.",
  },
  converted: {
    title: "No converted quotes yet",
    description: "Quotes turned into orders or invoices will appear here.",
  },
  archived: {
    title: "No archived quotes",
    description: "Quotes you've archived will appear here.",
  },
  all: {
    title: "No quote requests yet",
    description: "Quote requests submitted by customers will appear here.",
  },
};

export default function QuotesClient() {
  const { data: session, status: authStatus } = useSession();
  const [open, setOpen] = useState(false);
  const axios = useAxiosAuth();
  const { activeStoreId } = useStoreScope();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read tab from URL, fall back to "new"
  const statusParam = searchParams.get("status");
  const tab: QuoteTab = isValidTab(statusParam) ? statusParam : "new";

  // Write tab back to URL
  const setTab = (value: QuoteTab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("status", value);
    router.replace(`/sales/rfqs?${params.toString()}`);
  };

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
  const empty = EMPTY_STATE[tab];

  return (
    <section className="space-y-6">
      <PageHeader
        title="Quote Requests"
        description="View and manage customer quote requests."
        tooltip="New = just submitted. In progress = being handled. Converted = turned into an order/invoice. Archived = hidden from active work."
      >
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Quote
        </Button>
      </PageHeader>

      <Tabs value={tab} onValueChange={(v) => setTab(v as QuoteTab)}>
        <DataTable
          columns={quoteColumns}
          data={isLoading ? [] : rows}
          filterKey="customerEmail"
          filterPlaceholder="Search by email, id..."
          mobileRow={QuotesMobileRow}
          onRowClick={(quote) => router.push(`/sales/rfqs/${quote.id}`)}
          emptyState={{
            title: empty.title,
            description: empty.description,
            action: (
              <Button onClick={() => setOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Quote
              </Button>
            ),
          }}
          toolbarLeft={
            <>
              <FilterChips<QuoteTab>
                value={tab}
                onChange={setTab}
                chips={[
                  { value: "new", label: "New", count: counts.new },
                  {
                    value: "in_progress",
                    label: "In progress",
                    count: counts.inProgress,
                  },
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
                ]}
                wrap
              />

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

      <CreateQuoteModal open={open} onClose={() => setOpen(false)} />
    </section>
  );
}
