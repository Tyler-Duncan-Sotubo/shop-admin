/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { DataTable } from "@/shared/ui/data-table";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import Loading from "@/shared/ui/loading";
import PageHeader from "@/shared/ui/page-header";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import { invoiceColumns } from "./invoice-columns";
import { useGetInvoices } from "../hooks/use-invoices";
import { useRouter } from "next/navigation";

import { FilterChips, type FilterChip } from "@/shared/ui/filter-chips";
import { InvoicesMobileRow } from "./invoices-mobile-row";

type Tab = "draft" | "issued" | "paid" | "all";

export function InvoiceClient() {
  const { data: session } = useSession();
  const axios = useAxiosAuth();
  const { activeStoreId } = useStoreScope();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("all");

  const statusParam = tab === "all" ? undefined : tab;

  const { data: invoices = [], isLoading } = useGetInvoices(
    {
      storeId: activeStoreId,
      status: statusParam,
      limit: 50,
      offset: 0,
    },
    session,
    axios,
  );

  const cols = useMemo(() => invoiceColumns(), []);

  const chips: FilterChip<Tab>[] = [
    { value: "all", label: "All" },
    { value: "draft", label: "Draft" },
    { value: "issued", label: "Issued" },
    { value: "paid", label: "Paid" },
  ];

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Invoices"
        description="View and manage invoices"
        tooltip="Invoices are the financial record. Drafts can be edited; issued invoices are locked."
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <div className="mt-4">
          <DataTable
            columns={cols}
            data={invoices}
            mobileRow={InvoicesMobileRow}
            onRowClick={(inv) => router.push(`/sales/invoices/${inv.id}`)}
            toolbarLeft={
              <>
                {/* ✅ Mobile chips */}
                <FilterChips<Tab>
                  value={tab}
                  onChange={setTab}
                  chips={chips}
                  wrap
                  // or: scrollable
                />

                {/* ✅ Desktop tabs */}
                <div className="hidden sm:block">
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="draft">Draft</TabsTrigger>
                    <TabsTrigger value="issued">Issued</TabsTrigger>
                    <TabsTrigger value="paid">Paid</TabsTrigger>
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
