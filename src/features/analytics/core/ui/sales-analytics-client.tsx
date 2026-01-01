// src/features/analytics/commerce/ui/sales-analytics-client.tsx
"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import { CommerceSalesChartToday } from "./commerce-sales-chart-today";
import { CommerceGrossSalesCards } from "./commerce-gross-sales-cards";
import { LatestPaymentsCard } from "./latest-payments-card";
import { RecentOrdersCard } from "./recent-orders-card";
import { TopProductsCard } from "./top-products-card";
import { Skeleton } from "@/shared/ui/skeleton";
import { useCommerceOverviewBundle } from "../hooks/use-commerce-overview";

const SalesAnalyticsClient = ({
  range,
}: {
  range: { from: string; to: string; storeId?: string | null };
}) => {
  const { data: session } = useSession();
  const { activeStoreId } = useStoreScope();

  const q = useCommerceOverviewBundle(
    {
      ...range,
      storeId: activeStoreId ?? undefined,
      topProductsLimit: 5,
      recentOrdersLimit: 10,
      paymentsLimit: 5,
      topProductsBy: "revenue",
    },
    session
  );

  if (q.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          <div className="col-span-2">
            <Skeleton className="h-[380px] w-full rounded-xl" />
          </div>
          <Skeleton className="h-[380px] w-full rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          <Skeleton className="h-[380px] w-full rounded-xl" />
          <Skeleton className="h-[380px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  const bundle = q.data;

  if (!bundle) return null;

  return (
    <>
      {/* ✅ pass data instead of fetching inside */}
      <CommerceGrossSalesCards
        data={bundle.grossCards}
        isLoading={q.isLoading}
        hasRangeSelector={false}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        <div className="col-span-2">
          <CommerceSalesChartToday
            range={range}
            data={bundle.salesTimeseries}
            isLoading={q.isLoading}
            bucket={bundle.bucket}
          />
        </div>

        <LatestPaymentsCard
          rows={bundle.latestPayments}
          isLoading={q.isLoading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        <RecentOrdersCard rows={bundle.recentOrders} isLoading={q.isLoading} />

        <TopProductsCard rows={bundle.topProducts} isLoading={q.isLoading} />
      </div>
    </>
  );
};

export default SalesAnalyticsClient;
