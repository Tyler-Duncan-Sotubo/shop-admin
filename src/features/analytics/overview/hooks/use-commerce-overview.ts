"use client";

import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import type {
  DashboardRangeParams,
  CommerceCards,
  SalesTimeseriesPoint,
  TopProductRow,
  RecentOrderRow,
  OrdersByChannelPoint,
  CommerceGrossSalesCards,
  LatestPaymentRow,
} from "../../overview/types/commerce-analytics.type";

export function useCommerceCards(
  params: DashboardRangeParams,
  session?: { backendTokens?: { accessToken?: string } } | null
) {
  const axios = useAxiosAuth();
  const hasToken = Boolean(session?.backendTokens?.accessToken);

  const normalized = {
    from: params.from,
    to: params.to,
    storeId: params.storeId ?? undefined,
  };

  return useQuery({
    queryKey: ["analytics-commerce-cards", normalized],
    queryFn: async () => {
      const res = await axios.get("/api/analytics/commerce/admin/cards", {
        params: normalized,
      });
      return (res.data.data ?? res.data) as CommerceCards;
    },
    enabled: hasToken && !!normalized.from && !!normalized.to,
  });
}

/** ✅ NEW: gross sales cards */
export function useCommerceGrossSalesCards(
  params: DashboardRangeParams,
  session?: { backendTokens?: { accessToken?: string } } | null
) {
  const axios = useAxiosAuth();
  const hasToken = Boolean(session?.backendTokens?.accessToken);

  const normalized = {
    from: params.from,
    to: params.to,
    storeId: params.storeId ?? undefined,
  };

  return useQuery<CommerceGrossSalesCards>({
    queryKey: ["analytics-commerce-gross-sales-cards", normalized],
    queryFn: async () => {
      const res = await axios.get(
        "/api/analytics/commerce/admin/gross-sales-cards",
        { params: normalized }
      );
      return (res.data.data ?? res.data) as CommerceGrossSalesCards;
    },
    enabled: hasToken && !!normalized.from && !!normalized.to,
  });
}

/** ✅ UPDATED: bucket supports 15m for "today" chart */
export function useCommerceSalesTimeseries(
  params: DashboardRangeParams & { bucket?: "15m" | "day" | "month" },
  session?: { backendTokens?: { accessToken?: string } } | null
) {
  const axios = useAxiosAuth();
  const hasToken = Boolean(session?.backendTokens?.accessToken);

  const normalized = {
    from: params.from,
    to: params.to,
    storeId: params.storeId ?? undefined,
    bucket: params.bucket ?? "day",
  };

  return useQuery<SalesTimeseriesPoint[]>({
    queryKey: ["analytics-commerce-sales-timeseries", normalized],
    queryFn: async () => {
      const res = await axios.get(
        "/api/analytics/commerce/admin/sales-timeseries",
        { params: normalized }
      );

      return (res.data.data ?? res.data) as SalesTimeseriesPoint[];
    },
    enabled: hasToken && !!normalized.from && !!normalized.to,
  });
}

export function useCommerceTopProducts(
  params: DashboardRangeParams & { limit?: number; by?: "revenue" | "units" },
  session?: { backendTokens?: { accessToken?: string } } | null
) {
  const axios = useAxiosAuth();
  const hasToken = Boolean(session?.backendTokens?.accessToken);

  const normalized = {
    from: params.from,
    to: params.to,
    storeId: params.storeId ?? undefined,
    limit: params.limit ?? 10,
    by: params.by ?? "revenue",
  };

  return useQuery({
    queryKey: ["analytics-commerce-top-products", normalized],
    queryFn: async () => {
      const res = await axios.get(
        "/api/analytics/commerce/admin/top-products",
        {
          params: normalized,
        }
      );
      return (res.data.data ?? res.data) as TopProductRow[];
    },
    enabled: hasToken && !!normalized.from && !!normalized.to,
  });
}

export function useCommerceRecentOrders(
  params: DashboardRangeParams & {
    limit?: number;
    includeUnpaid?: boolean;
    orderBy?: "paidAt" | "createdAt";
    itemsPerOrder?: number;
  },
  session?: { backendTokens?: { accessToken?: string } } | null
) {
  const axios = useAxiosAuth();
  const hasToken = Boolean(session?.backendTokens?.accessToken);

  const normalized = {
    from: params.from,
    to: params.to,
    storeId: params.storeId ?? undefined,
    limit: params.limit ?? 5,
    includeUnpaid: params.includeUnpaid ?? true,
    orderBy: params.orderBy ?? "createdAt",
    itemsPerOrder: params.itemsPerOrder ?? 3,
  };

  return useQuery<RecentOrderRow[]>({
    queryKey: ["analytics-commerce-recent-orders", normalized],
    queryFn: async () => {
      const res = await axios.get(
        "/api/analytics/commerce/admin/recent-orders",
        { params: normalized }
      );
      return (res.data.data ?? res.data) as RecentOrderRow[];
    },
    enabled: hasToken && !!normalized.from && !!normalized.to,
  });
}

export function useCommerceOrdersByChannel(
  params: DashboardRangeParams & { metric?: "orders" | "revenue" },
  session?: { backendTokens?: { accessToken?: string } } | null
) {
  const axios = useAxiosAuth();
  const hasToken = Boolean(session?.backendTokens?.accessToken);

  const normalized = {
    from: params.from,
    to: params.to,
    storeId: params.storeId ?? undefined,
    metric: params.metric ?? "orders",
  };

  return useQuery<OrdersByChannelPoint[]>({
    queryKey: ["analytics-commerce-orders-by-channel", normalized],
    queryFn: async () => {
      const res = await axios.get(
        "/api/analytics/commerce/admin/orders-by-channel",
        { params: normalized }
      );
      return (res.data.data ?? res.data) as OrdersByChannelPoint[];
    },
    enabled: hasToken && !!normalized.from && !!normalized.to,
  });
}

/** ✅ NEW: latest payments */
export function useCommerceLatestPayments(
  params: DashboardRangeParams & { limit?: number },
  session?: { backendTokens?: { accessToken?: string } } | null
) {
  const axios = useAxiosAuth();
  const hasToken = Boolean(session?.backendTokens?.accessToken);

  const normalized = {
    from: params.from,
    to: params.to,
    storeId: params.storeId ?? undefined,
    limit: params.limit ?? 10,
  };

  return useQuery<LatestPaymentRow[]>({
    queryKey: ["analytics-commerce-latest-payments", normalized],
    queryFn: async () => {
      const res = await axios.get(
        "/api/analytics/commerce/admin/latest-payments",
        { params: normalized }
      );
      return (res.data.data ?? res.data) as LatestPaymentRow[];
    },
    enabled: hasToken && !!normalized.from && !!normalized.to,
  });
}
