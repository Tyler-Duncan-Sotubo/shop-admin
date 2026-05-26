"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import {
  useListDispatches,
  type DispatchStatus,
} from "../hooks/use-dispatches";
import { DataTable } from "@/shared/ui/data-table";
import { dispatchesColumns } from "./dispatches-columns";
import { DispatchMobileRow } from "./dispatch-mobile-row";
import { FilterChips, type FilterChip } from "@/shared/ui/filter-chips";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import Loading from "@/shared/ui/loading";
import { EmptyState } from "@/shared/ui/empty-state";
import { FaStore } from "react-icons/fa";
import { BsFillBoxSeamFill } from "react-icons/bs";

type StatusFilter = DispatchStatus | "all";

const chips: FilterChip<StatusFilter>[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "dispatched", label: "Dispatched" },
  { value: "cancelled", label: "Cancelled" },
];

export function DispatchesClient() {
  const axios = useAxiosAuth();
  const { data: session, status: authStatus } = useSession();
  const { activeStoreId } = useStoreScope();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const { data: dispatches = [], isLoading } = useListDispatches(
    activeStoreId,
    statusFilter === "all" ? undefined : statusFilter,
    session,
    axios,
  );

  if (authStatus === "loading") return <Loading />;

  if (!activeStoreId) {
    return (
      <EmptyState
        icon={<FaStore />}
        title="No store selected"
        description="Select a store to view dispatches."
        secondaryAction={{ label: "Manage stores", href: "/settings/stores" }}
      />
    );
  }

  return (
    <section className="space-y-4">
      <Tabs
        value={statusFilter}
        onValueChange={(v) => setStatusFilter(v as StatusFilter)}
      >
        <DataTable
          columns={dispatchesColumns}
          data={isLoading ? [] : dispatches}
          filterKey="search"
          filterPlaceholder="Search by order number, customer..."
          mobileRow={DispatchMobileRow}
          toolbarLeft={
            <>
              {/* Mobile */}
              <div className="sm:hidden -mx-3 px-3 min-w-0">
                <FilterChips<StatusFilter>
                  value={statusFilter}
                  onChange={setStatusFilter}
                  chips={chips}
                  wrap={false}
                  scrollable
                />
              </div>

              {/* Desktop */}
              <div className="hidden sm:block">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="dispatched">Dispatched</TabsTrigger>
                  <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                </TabsList>
              </div>
            </>
          }
        />

        {!isLoading && dispatches.length === 0 ? (
          <EmptyState
            icon={<BsFillBoxSeamFill />}
            title={
              statusFilter === "pending"
                ? "No pending dispatches"
                : "No dispatches found"
            }
            description={
              statusFilter === "pending"
                ? "When orders are ready to ship, they will appear here."
                : "No dispatches match the selected filter."
            }
          />
        ) : null}
      </Tabs>
    </section>
  );
}
