"use client";

import { DataTable } from "@/shared/ui/data-table";
import { Skeleton } from "@/shared/ui/skeleton";
import { useSession } from "next-auth/react";

import { landingPagesColumns } from "./landing-pages-columns";
import { useDashboardLandingPages } from "../../core/hooks/use-dashboard-overview";
import { usePersistedState } from "../../core/hooks/use-persisted-state";
import { Preset, useChartRange } from "../../core/hooks/use-preset-range";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/ui/select";
import PageHeader from "@/shared/ui/page-header";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import { LandingPagesMobileRow } from "./landing-pages-mobile-row";

export function AnalyticsLandingPagesTable() {
  const [preset, setPreset] = usePersistedState<Preset>(
    "analytics:chart-preset",
    "30d",
  );

  const range = useChartRange(preset);
  const { data: session } = useSession();
  const { activeStoreId } = useStoreScope();
  const { data, isLoading } = useDashboardLandingPages(
    { ...range, limit: 50, storeId: activeStoreId },
    session,
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Landing pages"
        description="See which pages users land on first and how much traffic they drive."
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
            <SelectItem value="1y">Last 12 months</SelectItem>
          </SelectContent>
        </Select>
      </PageHeader>

      {isLoading ? (
        <Skeleton className="h-72 w-full rounded-md" />
      ) : (
        <DataTable
          columns={landingPagesColumns}
          data={data ?? []}
          filterKey="title"
          filterPlaceholder="Search by page title or path…"
          showSearch={false}
          mobileRow={LandingPagesMobileRow}
        />
      )}
    </div>
  );
}
