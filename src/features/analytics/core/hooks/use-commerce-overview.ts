/* eslint-disable @typescript-eslint/no-explicit-any */
// src/features/analytics/commerce/hooks/use-commerce-overview-bundle.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import type { DashboardRangeParams } from "../../overview/types/commerce-analytics.type";

export type CommerceOverviewBundle = {
  bucket: "15m" | "day" | "month";

  grossCards: any; // replace with your CommerceGrossSalesCards type
  salesTimeseries: any[]; // replace with SalesTimeseriesPoint[]
  latestPayments: any[]; // replace with LatestPaymentRow[]
  recentOrders: any[]; // replace with RecentOrderRow[]
  topProducts: any[]; // replace with TopProductRow[]
};

export function useCommerceOverviewBundle(
  params: DashboardRangeParams & {
    topProductsLimit?: number;
    recentOrdersLimit?: number;
    paymentsLimit?: number;
    topProductsBy?: "revenue" | "units";
  },
  session?: { backendTokens?: { accessToken?: string } } | null
) {
  const axios = useAxiosAuth();
  const hasToken = Boolean(session?.backendTokens?.accessToken);

  const normalized = {
    from: params.from,
    to: params.to,
    storeId: params.storeId ?? undefined,
    topProductsLimit: params.topProductsLimit ?? 5,
    recentOrdersLimit: params.recentOrdersLimit ?? 10,
    paymentsLimit: params.paymentsLimit ?? 5,
    topProductsBy: params.topProductsBy ?? "revenue",
  };

  return useQuery<CommerceOverviewBundle>({
    queryKey: ["analytics-commerce-overview-bundle", normalized],
    queryFn: async () => {
      const res = await axios.get("/api/analytics/commerce/admin/overview", {
        params: normalized,
      });
      return (res.data.data ?? res.data) as CommerceOverviewBundle;
    },
    enabled: hasToken && !!normalized.from && !!normalized.to,
  });
}
