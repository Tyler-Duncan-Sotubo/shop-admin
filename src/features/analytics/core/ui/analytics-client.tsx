"use client";

import SalesAnalyticsClient from "./sales-analytics-client";
import { AnalyticsOverviewFeature } from "./anaytics-overview-feature";
import * as React from "react";
import { useSession } from "next-auth/react";
import { format, subDays } from "date-fns";
import type { DateRange } from "react-day-picker";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import { DateRangePicker } from "@/shared/ui/date-range-picker";
import { CompareModePicker } from "@/shared/ui/compare-mode-picker";
import { CompareMode } from "@/features/analytics/extended/types/extended-analytics.type";
import {
  useAbcClassification,
  useFulfillmentStats,
  useNewVsReturning,
  useSellThrough,
} from "@/features/analytics/extended/hooks/use-extended-analytics";
import { AbcClassificationTable } from "@/features/analytics/extended/ui/abc-classification-table";
import { SellThroughTable } from "@/features/analytics/extended/ui/sell-through-table";
import { NewVsReturningChart } from "@/features/analytics/extended/ui/new-vs-returning-chart";
import { FulfillmentCards } from "@/features/analytics/extended/ui/fulfillment-cards";
import { FilterChip, FilterChips } from "@/shared/ui/filter-chips";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs";
import PageHeader from "@/shared/ui/page-header";
import { usePersistedState } from "../hooks/use-persisted-state";

type AnalyticsTab = "commerce" | "products" | "customers" | "fulfillment";

const ANALYTICS_TABS: FilterChip<AnalyticsTab>[] = [
  { value: "commerce", label: "Commerce" },
  { value: "products", label: "Products" },
  { value: "customers", label: "Customers" },
  { value: "fulfillment", label: "Fulfillment" },
];

function toIso(d: Date) {
  return d.toISOString();
}

export function AnalyticsClient() {
  const { data: session } = useSession();
  const { activeStoreId } = useStoreScope();
  const [activeTab, setActiveTab] = React.useState<AnalyticsTab>("commerce");

  const [extRange, setExtRange] = React.useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const [compareMode, setCompareMode] = usePersistedState<CompareMode>(
    "analytics:compare-mode",
    "mom",
  );

  const [customCompareRange, setCustomCompareRange] = React.useState<
    DateRange | undefined
  >(undefined);

  const extFrom = extRange.from ? toIso(extRange.from) : "";
  const extTo = extRange.to ? toIso(extRange.to) : "";

  const baseParams = {
    from: extFrom,
    to: extTo,
    storeId: activeStoreId,
    compareMode,
    compareFrom:
      compareMode === "custom" && customCompareRange?.from
        ? toIso(customCompareRange.from)
        : undefined,
    compareTo:
      compareMode === "custom" && customCompareRange?.to
        ? toIso(customCompareRange.to)
        : undefined,
  };

  // SalesAnalyticsClient expects { from, to } as strings
  const commerceRange = { from: extFrom, to: extTo };
  const abc = useAbcClassification(baseParams, session);
  const sellThrough = useSellThrough(baseParams, session);
  const newVsRet = useNewVsReturning({ ...baseParams, bucket: "day" }, session);
  const fulfillment = useFulfillmentStats(baseParams, session);

  const rangeLabel =
    extRange.from && extRange.to
      ? `${format(extRange.from, "MMM d")} – ${format(extRange.to, "MMM d, yyyy")}`
      : "Select range";

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Analytics Overview"
          description="Overview of your store's performance"
        />
        <div className="flex flex-wrap items-center gap-2">
          <DateRangePicker
            value={extRange}
            onChange={(r) => r && setExtRange(r)}
            placeholder="Select range"
            className="h-8"
          />
          <CompareModePicker
            value={compareMode}
            onChange={setCompareMode}
            customRange={customCompareRange}
            onCustomRangeChange={setCustomCompareRange}
          />
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as AnalyticsTab)}
      >
        {/* Mobile */}
        <div className="sm:hidden">
          <FilterChips<AnalyticsTab>
            value={activeTab}
            onChange={setActiveTab}
            chips={ANALYTICS_TABS}
            wrap
          />
        </div>

        {/* Desktop */}
        <div className="hidden sm:block">
          <TabsList>
            <TabsTrigger value="commerce">Commerce</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="fulfillment">Fulfillment</TabsTrigger>
          </TabsList>
        </div>

        {/* ── Commerce ── */}
        <TabsContent value="commerce" className="mt-6 space-y-6">
          <SalesAnalyticsClient range={commerceRange} />
          <AnalyticsOverviewFeature range={commerceRange} />
        </TabsContent>

        {/* ── Products ── */}
        <TabsContent value="products" className="mt-6 space-y-6">
          <div>
            <h3 className="mb-1 text-sm font-semibold">ABC Classification</h3>
            <p className="mb-4 text-xs text-muted-foreground">
              A = top 70% revenue · B = next 20% · C = bottom 10%
            </p>
            <AbcClassificationTable data={abc.data} isLoading={abc.isLoading} />
          </div>
          <div>
            <h3 className="mb-1 text-sm font-semibold">Sell-Through Rate</h3>
            <p className="mb-4 text-xs text-muted-foreground">
              Units sold ÷ (units sold + units available) for {rangeLabel}
            </p>
            <SellThroughTable
              data={sellThrough.data}
              isLoading={sellThrough.isLoading}
            />
          </div>
        </TabsContent>

        {/* ── Customers ── */}
        <TabsContent value="customers" className="mt-6 space-y-6">
          <div>
            <h3 className="mb-1 text-sm font-semibold">New vs Returning</h3>
            <p className="mb-4 text-xs text-muted-foreground">
              Customer acquisition and retention for {rangeLabel}
            </p>
            <NewVsReturningChart
              data={newVsRet.data}
              isLoading={newVsRet.isLoading}
            />
          </div>
        </TabsContent>

        {/* ── Fulfillment ── */}
        <TabsContent value="fulfillment" className="mt-6 space-y-6">
          <div>
            <h3 className="mb-1 text-sm font-semibold">
              Fulfillment Performance
            </h3>
            <p className="mb-4 text-xs text-muted-foreground">
              Based on time between order placed and status reaching fulfilled
              for {rangeLabel}
            </p>
            <FulfillmentCards
              data={fulfillment.data}
              isLoading={fulfillment.isLoading}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
