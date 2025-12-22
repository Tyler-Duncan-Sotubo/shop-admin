"use client";

import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import Loading from "@/shared/ui/loading";
import PageHeader from "@/shared/ui/page-header";
import { DataTable } from "@/shared/ui/data-table";
import { useStoreScope } from "@/lib/providers/store-scope-provider";

import { useStoreTransferHistory } from "../hooks/use-store-transfer-history";
import { storeTransferHistoryColumns } from "./store-transfer-history-columns";
import { EmptyState } from "@/shared/ui/empty-state";
import { FaStore, FaHistory } from "react-icons/fa";

export function StoreTransferHistoryTable() {
  const { data: session, status: authStatus } = useSession();
  const axios = useAxiosAuth();
  const { activeStoreId } = useStoreScope();

  const { data = [], isLoading } = useStoreTransferHistory(
    activeStoreId,
    session,
    axios
  );

  // ─────────────────────────────────────────────
  // Loading
  // ─────────────────────────────────────────────
  if (authStatus === "loading" || isLoading) return <Loading />;

  // ─────────────────────────────────────────────
  // No store selected
  // ─────────────────────────────────────────────

  if (!activeStoreId) {
    return (
      <EmptyState
        icon={<FaStore />}
        title="No store selected"
        description="Select a store to view its transfer history."
        secondaryAction={{ label: "Manage stores", href: "/settings/stores" }}
      />
    );
  }

  // ─────────────────────────────────────────────
  // No history yet
  // ─────────────────────────────────────────────
  if (data.length === 0) {
    return (
      <section className="space-y-4">
        <EmptyState
          icon={<FaHistory />}
          title="No transfer history yet"
          description="Once transfers are created for this store, activity will show up here."
          secondaryAction={{
            label: "View transfers",
            href: "/inventory/transfers",
          }}
        />
      </section>
    );
  }

  // Normal table
  return (
    <section className="space-y-4">
      <PageHeader
        title="Transfer history"
        description="Recent transfer activity for this store."
        tooltip="Shows who created/updated transfers that involve this store."
      />

      <DataTable
        columns={storeTransferHistoryColumns}
        data={data}
        filterKey="routeSearch"
        filterPlaceholder="Search by location, user, or transfer id…"
      />
    </section>
  );
}
