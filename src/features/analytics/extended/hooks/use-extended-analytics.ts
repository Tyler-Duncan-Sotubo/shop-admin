// src/features/analytics/extended/hooks/use-extended-analytics.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import type {
  ExtendedSalesCards,
  ProductAbcRow,
  SellThroughRow,
  NewVsReturningRow,
  FulfillmentStats,
  ExtendedAnalyticsParams,
} from "../types/extended-analytics.type";

type Session = { backendTokens?: { accessToken?: string } } | null;

function useEnabled(session: Session, params: ExtendedAnalyticsParams) {
  return Boolean(
    session?.backendTokens?.accessToken && params.from && params.to,
  );
}

function cleanParams(p: ExtendedAnalyticsParams) {
  return {
    from: p.from,
    to: p.to,
    storeId: p.storeId ?? undefined,
    compareMode: p.compareMode ?? "mom",
    compareFrom: p.compareFrom ?? undefined,
    compareTo: p.compareTo ?? undefined,
  };
}

export function useExtendedSalesCards(
  params: ExtendedAnalyticsParams,
  session: Session,
) {
  const axios = useAxiosAuth();
  const normalized = cleanParams(params);

  return useQuery<ExtendedSalesCards>({
    queryKey: ["analytics-extended-sales-cards", normalized],
    enabled: useEnabled(session, params),
    queryFn: async () => {
      const res = await axios.get("/api/analytics/extended/admin/sales-cards", {
        params: normalized,
      });
      return res.data.data ?? res.data;
    },
  });
}

export function useAbcClassification(
  params: ExtendedAnalyticsParams & { limit?: number },
  session: Session,
) {
  const axios = useAxiosAuth();
  const normalized = { ...cleanParams(params), limit: params.limit ?? 100 };

  return useQuery<ProductAbcRow[]>({
    queryKey: ["analytics-extended-abc", normalized],
    enabled: useEnabled(session, params),
    queryFn: async () => {
      const res = await axios.get("/api/analytics/extended/admin/abc", {
        params: normalized,
      });
      return res.data.data ?? res.data;
    },
  });
}

export function useSellThrough(
  params: ExtendedAnalyticsParams & { locationId?: string },
  session: Session,
) {
  const axios = useAxiosAuth();
  const normalized = {
    ...cleanParams(params),
    locationId: params.locationId ?? undefined,
  };

  return useQuery<SellThroughRow[]>({
    queryKey: ["analytics-extended-sell-through", normalized],
    enabled: useEnabled(session, params),
    queryFn: async () => {
      const res = await axios.get(
        "/api/analytics/extended/admin/sell-through",
        { params: normalized },
      );
      return res.data.data ?? res.data;
    },
  });
}

export function useNewVsReturning(
  params: ExtendedAnalyticsParams & { bucket?: "day" | "week" | "month" },
  session: Session,
) {
  const axios = useAxiosAuth();
  const normalized = {
    ...cleanParams(params),
    bucket: params.bucket ?? "day",
  };

  return useQuery<NewVsReturningRow[]>({
    queryKey: ["analytics-extended-new-vs-returning", normalized],
    enabled: useEnabled(session, params),
    queryFn: async () => {
      const res = await axios.get(
        "/api/analytics/extended/admin/new-vs-returning",
        { params: normalized },
      );
      return res.data.data ?? res.data;
    },
  });
}

export function useFulfillmentStats(
  params: ExtendedAnalyticsParams & { onTimeThresholdHours?: number },
  session: Session,
) {
  const axios = useAxiosAuth();
  const normalized = {
    ...cleanParams(params),
    onTimeThresholdHours: params.onTimeThresholdHours ?? 48,
  };

  return useQuery<FulfillmentStats>({
    queryKey: ["analytics-extended-fulfillment", normalized],
    enabled: useEnabled(session, params),
    queryFn: async () => {
      const res = await axios.get("/api/analytics/extended/admin/fulfillment", {
        params: normalized,
      });
      return res.data.data ?? res.data;
    },
  });
}
