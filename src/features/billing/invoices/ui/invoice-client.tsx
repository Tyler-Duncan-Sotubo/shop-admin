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
    axios
  );

  const cols = useMemo(() => invoiceColumns(), []);

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Invoices"
        description="View and manage invoices"
        tooltip="Invoices are the financial record. Drafts can be edited; issued invoices are locked."
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="issued">Issued</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-4">
        <DataTable
          columns={cols}
          data={invoices}
          onRowClick={(inv) => router.push(`/sales/invoices/${inv.id}`)}
        />
      </div>
    </div>
  );
}
