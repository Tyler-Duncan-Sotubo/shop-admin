/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQueries } from "@tanstack/react-query";
import type { Session } from "next-auth";
import type { AxiosInstance } from "axios";

async function fetchCount(
  axios: AxiosInstance,
  storeId: string | null,
  status?: string
): Promise<number> {
  const params: Record<string, any> = { limit: 1, offset: 0 };
  if (status) params.status = status;
  if (storeId) params.storeId = storeId;

  const res = await axios.get("/api/orders", { params });
  return Number(res.data.data.count ?? 0);
}

export function useOrderCountsForTabs(
  session: Session | null,
  axios: AxiosInstance,
  storeId: string | null
) {
  const enabled = !!session?.backendTokens?.accessToken; // add && !!storeId if required

  const queries = useQueries({
    queries: [
      { key: "all", status: undefined },
      { key: "on_hold", status: "pending_payment" },
      { key: "paid", status: "paid" },
      { key: "fulfilled", status: "fulfilled" },
      { key: "cancelled", status: "cancelled" },
    ].map(({ key, status }) => ({
      queryKey: ["orders", "count", key, storeId],
      enabled,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      queryFn: () => fetchCount(axios, storeId, status),
    })),
  });

  return {
    all: queries[0].data ?? 0,
    onHold: queries[1].data ?? 0,
    paid: queries[2].data ?? 0,
    fulfilled: queries[3].data ?? 0,
    cancelled: queries[4].data ?? 0,
  };
}
