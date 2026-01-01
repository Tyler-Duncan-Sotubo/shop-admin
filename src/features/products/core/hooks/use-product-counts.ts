/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQueries } from "@tanstack/react-query";
import type { AxiosInstance } from "axios";
import type { Session } from "next-auth";

// If you don't have a ProductStatus union, use this:
type Status =
  | "active"
  | "archived"
  | "draft"
  | "inactive"
  | "out_of_stock"
  | string;

/**
 * Calls the existing list endpoint with limit=1 and reads `total`.
 * Backend must return: { items, total, limit, offset }
 */
async function fetchProductCount(
  axios: AxiosInstance,
  params: {
    storeId?: string;
    search?: string;
    categoryId?: string;
    status?: Status;
  }
): Promise<number> {
  const qp: Record<string, any> = { limit: 1, offset: 0 };

  if (params.search) qp.search = params.search;
  if (params.storeId) qp.storeId = params.storeId;
  if (params.categoryId) qp.categoryId = params.categoryId;
  if (params.status) qp.status = params.status;

  const res = await axios.get("/api/catalog/products/admin", { params: qp });

  const payload = res.data?.data ?? res.data;
  return Number(payload?.total ?? 0);
}

/**
 * Counts for product tabs (All / Active / Archived by default)
 * - Uses useQueries => parallel requests
 * - Includes storeId/search/categoryId in queryKey for cache correctness
 */
export function useProductCountsForTabs(
  session: Session | null,
  axios: AxiosInstance,
  args: {
    storeId?: string;
    search?: string;
    categoryId?: string;
    // override which statuses you want counts for
    statuses?: Array<{ key: string; status?: Status }>;
  } = {}
) {
  const enabled = !!session?.backendTokens?.accessToken;

  const storeId = args.storeId || undefined;
  const search = args.search?.trim() || undefined;
  const categoryId = args.categoryId || undefined;

  const statuses =
    args.statuses ??
    ([
      { key: "all", status: undefined },
      { key: "active", status: "active" },
      { key: "archived", status: "archived" },
    ] as const);

  const q = useQueries({
    queries: statuses.map(({ key, status }) => ({
      queryKey: [
        "products",
        "count",
        key,
        storeId ?? "all",
        categoryId ?? "all",
        search ?? "",
      ],
      enabled,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      queryFn: () =>
        fetchProductCount(axios, {
          storeId,
          search,
          categoryId,
          status,
        }),
    })),
  });

  // Build a dynamic result object keyed by `key`
  const counts = statuses.reduce<Record<string, number>>((acc, s, idx) => {
    acc[s.key] = q[idx]?.data ?? 0;
    return acc;
  }, {});

  return {
    counts,
    isLoading: q.some((x) => x.isLoading),
    isError: q.some((x) => x.isError),
  };
}
