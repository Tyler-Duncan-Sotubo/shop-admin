import { useQueries } from "@tanstack/react-query";
import type { Session } from "next-auth";
import type { AxiosInstance } from "axios";

async function fetchCount(
  axios: AxiosInstance,
  storeId: string | null,
  status?: string
): Promise<number> {
  const res = await axios.get("/api/orders", {
    params: { limit: 1, offset: 0, status, storeId },
  });
  return Number(res.data.data.count ?? 0);
}

export function useOrderCountsForTabs(
  session: Session | null,
  axios: AxiosInstance,
  storeId: string | null
) {
  const enabled = !!session?.backendTokens?.accessToken;

  const q = useQueries({
    queries: [
      {
        queryKey: ["orders", "count", "all"],
        enabled,
        queryFn: () => fetchCount(axios, storeId),
      },
      {
        queryKey: ["orders", "count", "on_hold"],
        enabled,
        queryFn: () => fetchCount(axios, storeId, "pending_payment"),
      },
      {
        queryKey: ["orders", "count", "paid"],
        enabled,
        queryFn: () => fetchCount(axios, storeId, "paid"),
      },
      {
        queryKey: ["orders", "count", "fulfilled"],
        enabled,
        queryFn: () => fetchCount(axios, storeId, "fulfilled"),
      },
      {
        queryKey: ["orders", "count", "cancelled"],
        enabled,
        queryFn: () => fetchCount(axios, storeId, "cancelled"),
      },
    ],
  });

  return {
    all: q[0].data ?? 0,
    onHold: q[1].data ?? 0,
    paid: q[2].data ?? 0,
    fulfilled: q[3].data ?? 0,
    cancelled: q[4].data ?? 0,
  };
}
