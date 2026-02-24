/* eslint-disable @typescript-eslint/no-explicit-any */
// src/features/analytics/commerce/hooks/use-commerce-overview-bundle.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import type { DashboardRangeParams } from "../../overview/types/commerce-analytics.type";

type SalesChartPreset =
  | "30m"
  | "12h"
  | "today"
  | "yesterday"
  | "last_week"
  | "last_month"
  | "7d"
  | "30d"
  | "90d"
  | "365d"
  | "12m";

export type CommerceOverviewBundle = {
  bucket: "15m" | "day" | "month";

  grossCards: any;
  salesTimeseries: any[];
  latestPayments: any[];
  recentOrders: any[];
  topProducts: any[];

  // optional (nice for debugging / UI)
  salesPreset?: SalesChartPreset | null;
  salesFrom?: string;
  salesTo?: string;
};

export function useCommerceOverviewBundle(
  params: DashboardRangeParams & {
    // ✅ overview range (for cards/orders/products/payments)
    topProductsLimit?: number;
    recentOrdersLimit?: number;
    paymentsLimit?: number;
    topProductsBy?: "revenue" | "units";

    // ✅ only for sales over time
    salesPreset?: SalesChartPreset;
  },
  session?: { backendTokens?: { accessToken?: string } } | null,
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

    // ✅ send only if provided
    ...(params.salesPreset ? { salesPreset: params.salesPreset } : {}),
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
