"use client";

import { useStoreScope } from "@/lib/providers/store-scope-provider";
import { useListTransfers } from "../hooks/use-transfers-list";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { useSession } from "next-auth/react";
import { DataTable } from "@/shared/ui/data-table";
import { transfersColumns } from "./invertory-transfer-column";
import Loading from "@/shared/ui/loading";
import PageHeader from "@/shared/ui/page-header";
import { EmptyState } from "@/shared/ui/empty-state";
import { FaExchangeAlt, FaStore } from "react-icons/fa";

const InventoryTransferClient = () => {
  const axios = useAxiosAuth();
  const { data: session, status: authStatus } = useSession();
  const { activeStoreId } = useStoreScope();

  const { data: transfers = [], isLoading } = useListTransfers(
    activeStoreId,
    session,
    axios
  );

  // ─────────────────────────────────────────────
  // Loading
  // ─────────────────────────────────────────────
  if (authStatus === "loading" || isLoading) {
    return <Loading />;
  }

  // ─────────────────────────────────────────────
  // No store selected
  // ─────────────────────────────────────────────
  if (!activeStoreId) {
    return (
      <EmptyState
        icon={<FaStore />}
        title="No store selected"
        description="Select or create a store to view inventory transfers."
        secondaryAction={{ label: "Manage stores", href: "/settings/stores" }}
      />
    );
  }

  // ─────────────────────────────────────────────
  // No transfers yet
  // ─────────────────────────────────────────────
  if (transfers.length === 0) {
    return (
      <section className="space-y-6">
        <EmptyState
          icon={<FaExchangeAlt />}
          title="No transfers yet"
          description="Inventory transfers between locations will appear here."
          secondaryAction={{
            label: "Manage inventory",
            href: "/inventory",
          }}
        />
      </section>
    );
  }

  // ─────────────────────────────────────────────
  // Normal render
  // ─────────────────────────────────────────────
  return (
    <section className="space-y-6">
      <PageHeader
        title="Inventory Transfers"
        description="Manage inventory transfers between locations."
      />
      <DataTable
        columns={transfersColumns}
        data={transfers}
        filterKey="search"
        filterPlaceholder="Search transfers by ID, location..."
      />
    </section>
  );
};

export default InventoryTransferClient;
