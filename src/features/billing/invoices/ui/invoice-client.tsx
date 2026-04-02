// features/invoices/components/invoice-client.tsx
"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { DataTable } from "@/shared/ui/data-table";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import Loading from "@/shared/ui/loading";
import PageHeader from "@/shared/ui/page-header";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import { invoiceColumns } from "./invoice-columns";
import { useGetInvoices } from "../hooks/use-invoices";
import { useInvoiceCountsForTabs } from "../hooks/use-invoice-counts";
import { FilterChips, type FilterChip } from "@/shared/ui/filter-chips";
import { InvoicesMobileRow } from "./invoices-mobile-row";
import { TabLabel } from "@/shared/ui/tab-label";

type Tab = "draft" | "issued" | "paid" | "all";

const VALID_TABS: Tab[] = ["draft", "issued", "paid", "all"];

function isValidTab(value: string | null): value is Tab {
  return VALID_TABS.includes(value as Tab);
}

export function InvoiceClient() {
  const { data: session } = useSession();
  const axios = useAxiosAuth();
  const { activeStoreId } = useStoreScope();
  const router = useRouter();
  const searchParams = useSearchParams();

  const statusParam = searchParams.get("status");
  const tab: Tab = isValidTab(statusParam) ? statusParam : "all";

  const setTab = (value: Tab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("status", value);
    router.replace(`/sales/invoices?${params.toString()}`);
  };

  const counts = useInvoiceCountsForTabs(session, axios, activeStoreId);

  const { data = [], isLoading } = useGetInvoices(
    {
      storeId: activeStoreId,
      status: tab === "all" ? undefined : tab,
      limit: 50,
      offset: 0,
    },
    session,
    axios,
  );

  const invoices = Array.isArray(data) ? [] : (data?.rows ?? []);
  const cols = useMemo(() => invoiceColumns(), []);

  const chips: FilterChip<Tab>[] = [
    { value: "all", label: "All", count: counts.all },
    { value: "draft", label: "Draft", count: counts.draft },
    { value: "issued", label: "Issued", count: counts.issued },
    { value: "paid", label: "Paid", count: counts.paid, showZero: false },
  ];

  const EMPTY_STATE: Record<Tab, { title: string; description: string }> = {
    all: {
      title: "No invoices yet",
      description: "Invoices will appear here once they are created.",
    },
    draft: {
      title: "No draft invoices",
      description: "Invoices that haven't been issued yet will appear here.",
    },
    issued: {
      title: "No issued invoices",
      description: "Invoices sent to customers will appear here.",
    },
    paid: {
      title: "No paid invoices",
      description: "Invoices with full payment received will appear here.",
    },
  };

  // then in DataTable
  const empty = EMPTY_STATE[tab];

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Invoices"
        description="View and manage invoices"
        tooltip="Invoices are the financial record. Drafts can be edited; issued invoices are locked."
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <div className="mt-4">
          <DataTable
            columns={cols}
            data={invoices}
            mobileRow={InvoicesMobileRow}
            onRowClick={(inv) => router.push(`/sales/invoices/${inv.id}`)}
            emptyState={{
              title: empty.title,
              description: empty.description,
            }}
            toolbarLeft={
              <>
                <FilterChips<Tab>
                  value={tab}
                  onChange={setTab}
                  chips={chips}
                  wrap
                />

                <div className="hidden sm:block">
                  <TabsList>
                    <TabsTrigger value="all">
                      <TabLabel label="All" count={counts.all} />
                    </TabsTrigger>
                    <TabsTrigger value="draft">
                      <TabLabel label="Draft" count={counts.draft} />
                    </TabsTrigger>
                    <TabsTrigger value="issued">
                      <TabLabel label="Issued" count={counts.issued} />
                    </TabsTrigger>
                    <TabsTrigger value="paid">
                      <TabLabel
                        label="Paid"
                        count={counts.paid}
                        showZero={false}
                      />
                    </TabsTrigger>
                  </TabsList>
                </div>
              </>
            }
          />
        </div>
      </Tabs>
    </div>
  );
}
