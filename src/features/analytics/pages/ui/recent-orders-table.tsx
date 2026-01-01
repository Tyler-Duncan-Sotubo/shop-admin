"use client";

import { DataTable } from "@/shared/ui/data-table";
import { recentOrdersColumns } from "./recent-orders-columns";
import { useCommerceRecentOrders } from "../../overview/hooks/use-commerce-overview";
import { Preset, usePresetRange } from "../../core/hooks/use-preset-range";
import { useSession } from "next-auth/react";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import PageHeader from "@/shared/ui/page-header";
import { usePersistedState } from "../../core/hooks/use-persisted-state";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/ui/select";
import Loading from "@/shared/ui/loading";

export function RecentOrdersTable() {
  const { data: session } = useSession();
  const { activeStoreId } = useStoreScope();

  const [preset, setPreset] = usePersistedState<Preset>(
    "commerce:recent-orders:preset",
    "7d"
  );

  const range = usePresetRange(preset);

  const { data, isLoading } = useCommerceRecentOrders(
    {
      ...range,
      limit: 20,
      orderBy: "paidAt",
      includeUnpaid: true,
      storeId: activeStoreId,
    },
    session
  );

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Recent Orders"
        description="Latest orders placed in your store"
      >
        <Select value={preset} onValueChange={(v) => setPreset(v as Preset)}>
          <SelectTrigger
            className="ml-auto hidden w-40 rounded-lg sm:flex"
            aria-label="Select range"
          >
            <SelectValue />
          </SelectTrigger>

          <SelectContent align="end" className="rounded-xl">
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </PageHeader>

      <DataTable
        columns={recentOrdersColumns}
        data={data}
        filterKey="orderNumber"
        filterPlaceholder="Search by order #…"
        disableRowSelection
      />
    </div>
  );
}
