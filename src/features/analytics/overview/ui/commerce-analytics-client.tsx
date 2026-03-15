/* eslint-disable @typescript-eslint/no-explicit-any */
// src/features/analytics/extended/ui/extended-analytics-client.tsx
"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { format, subDays } from "date-fns";
import type { DateRange } from "react-day-picker";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import { usePersistedState } from "@/features/analytics/core/hooks/use-persisted-state";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs";
import { DateRangePicker } from "@/shared/ui/date-range-picker";
import { CompareModePicker } from "@/shared/ui/compare-mode-picker";
import PageHeader from "@/shared/ui/page-header";
import { CompareMode } from "../../extended/types/extended-analytics.type";
import {
  useAbcClassification,
  useExtendedSalesCards,
  useFulfillmentStats,
  useNewVsReturning,
  useSellThrough,
} from "../../extended/hooks/use-extended-analytics";
import { ExtendedSalesCards } from "../../extended/ui/extended-sales-cards";
import { CommerceSalesChart } from "./commerce-sales-chart";
import { CommerceOrdersByChannelPie } from "./commerce-order-by-channel";
import { AbcClassificationTable } from "../../extended/ui/abc-classification-table";
import { SellThroughTable } from "../../extended/ui/sell-through-table";
import { NewVsReturningChart } from "../../extended/ui/new-vs-returning-chart";
import { FulfillmentCards } from "../../extended/ui/fulfillment-cards";
import { AnalyticsClient } from "../../core/ui/analytics-client";

function toIso(d: Date) {
  return d.toISOString();
}

export function CommerceAnalyticsClient() {
  const { data: session } = useSession();
  const { activeStoreId } = useStoreScope();

  // global date range
  const [range, setRange] = React.useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  // comparison mode
  const [compareMode, setCompareMode] = usePersistedState<CompareMode>(
    "analytics:compare-mode",
    "mom",
  );

  const [customCompareRange, setCustomCompareRange] = React.useState<
    DateRange | undefined
  >(undefined);

  const from = range.from ? toIso(range.from) : "";
  const to = range.to ? toIso(range.to) : "";

  const baseParams = {
    from,
    to,
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

  const salesCards = useExtendedSalesCards(baseParams, session);
  const abc = useAbcClassification(baseParams, session);
  const sellThrough = useSellThrough(baseParams, session);
  const newVsRet = useNewVsReturning({ ...baseParams, bucket: "day" }, session);
  const fulfillment = useFulfillmentStats(baseParams, session);

  const rangeLabel =
    range.from && range.to
      ? `${format(range.from, "MMM d")} – ${format(range.to, "MMM d, yyyy")}`
      : "Select range";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Overview" description="" />
        <div className="flex flex-wrap items-center gap-2">
          <DateRangePicker
            value={range}
            onChange={(r) => r && setRange(r)}
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

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="commerce">Commerce</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="fulfillment">Fulfillment</TabsTrigger>
        </TabsList>

        {/* ── Overview ── */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <ExtendedSalesCards
            data={salesCards.data}
            isLoading={salesCards.isLoading}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 items-stretch">
            <div className="md:col-span-2">
              <CommerceSalesChart
                session={session}
                activeStoreId={activeStoreId}
              />
            </div>
            <div className="md:col-span-1">
              <CommerceOrdersByChannelPie
                session={session}
                activeStoreId={activeStoreId}
              />
            </div>
          </div>
        </TabsContent>

        {/* ── Commerce ── */}
        <TabsContent value="commerce" className="space-y-6 mt-6">
          <AnalyticsClient
            externalRange={range as any}
            shouldShowHeader={false}
          />
        </TabsContent>

        {/* ── Products ── */}
        <TabsContent value="products" className="space-y-6 mt-6">
          <div>
            <h3 className="text-sm font-semibold mb-1">ABC Classification</h3>
            <p className="text-xs text-muted-foreground mb-4">
              A = top 70% revenue · B = next 20% · C = bottom 10%
            </p>
            <AbcClassificationTable data={abc.data} isLoading={abc.isLoading} />
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-1">Sell-Through Rate</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Units sold ÷ (units sold + units available) for {rangeLabel}
            </p>
            <SellThroughTable
              data={sellThrough.data}
              isLoading={sellThrough.isLoading}
            />
          </div>
        </TabsContent>

        {/* ── Customers ── */}
        <TabsContent value="customers" className="space-y-6 mt-6">
          <div>
            <h3 className="text-sm font-semibold mb-1">New vs Returning</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Customer acquisition and retention for {rangeLabel}
            </p>
            <NewVsReturningChart
              data={newVsRet.data}
              isLoading={newVsRet.isLoading}
            />
          </div>
        </TabsContent>

        {/* ── Fulfillment ── */}
        <TabsContent value="fulfillment" className="space-y-6 mt-6">
          <div>
            <h3 className="text-sm font-semibold mb-1">
              Fulfillment Performance
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
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
