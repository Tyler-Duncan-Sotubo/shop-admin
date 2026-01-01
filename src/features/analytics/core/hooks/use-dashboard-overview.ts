"use client";

import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import type {
  DashboardRangeParams,
  DashboardOverview,
  TopPageRow,
  LandingPageRow,
} from "../types/dashboard-analytics.type";

export function useDashboardOverview(
  params: DashboardRangeParams,
  session?: { backendTokens?: { accessToken?: string } } | null
) {
  const axios = useAxiosAuth();
  const hasToken = Boolean(session?.backendTokens?.accessToken);

  const normalized: DashboardRangeParams = {
    from: params.from,
    to: params.to,
    storeId: params.storeId ?? undefined,
  };

  return useQuery({
    queryKey: ["analytics-dashboard-overview", normalized],
    queryFn: async () => {
      const res = await axios.get("/api/analytics/dashboard/overview", {
        params: normalized,
      });
      console.log("Dashboard overview response:", res.data);
      return res.data.data as DashboardOverview;
    },
    enabled: hasToken && !!normalized.from && !!normalized.to,
  });
}

export function useDashboardTopPages(
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

  return useQuery({
    queryKey: ["analytics-dashboard-top-pages", normalized],
    queryFn: async () => {
      const res = await axios.get("/api/analytics/dashboard/top-pages", {
        params: normalized,
      });
      return res.data.data as TopPageRow[];
    },
    enabled: hasToken && !!normalized.from && !!normalized.to,
  });
}

export function useDashboardLandingPages(
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

  return useQuery({
    queryKey: ["analytics-dashboard-landing-pages", normalized],
    queryFn: async () => {
      const res = await axios.get("/api/analytics/dashboard/landing-pages", {
        params: normalized,
      });
      return res.data.data as LandingPageRow[];
    },
    enabled: hasToken && !!normalized.from && !!normalized.to,
  });
}
