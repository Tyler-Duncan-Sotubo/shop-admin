// src/features/analytics/extended/ui/extended-analytics-client.tsx
"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { subDays } from "date-fns";
import type { DateRange } from "react-day-picker";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import { usePersistedState } from "@/features/analytics/core/hooks/use-persisted-state";
import { DateRangePicker } from "@/shared/ui/date-range-picker";
import { CompareModePicker } from "@/shared/ui/compare-mode-picker";
import PageHeader from "@/shared/ui/page-header";
import { CompareMode } from "../../extended/types/extended-analytics.type";
import { useExtendedSalesCards } from "../../extended/hooks/use-extended-analytics";
import { ExtendedSalesCards } from "../../extended/ui/extended-sales-cards";
import { CommerceSalesChart } from "./commerce-sales-chart";
import { CommerceOrdersByChannelPie } from "./commerce-order-by-channel";

function toIso(d: Date) {
  return d.toISOString();
}

export function CommerceAnalyticsClient() {
  const { data: session } = useSession();
  const { activeStoreId } = useStoreScope();

  const [range, setRange] = React.useState<DateRange>({
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

      <ExtendedSalesCards
        data={salesCards.data}
        isLoading={salesCards.isLoading}
      />

      <div className="grid items-stretch grid-cols-1 gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <CommerceSalesChart session={session} activeStoreId={activeStoreId} />
        </div>
        <div className="md:col-span-1">
          <CommerceOrdersByChannelPie
            session={session}
            activeStoreId={activeStoreId}
          />
        </div>
      </div>
    </div>
  );
}
