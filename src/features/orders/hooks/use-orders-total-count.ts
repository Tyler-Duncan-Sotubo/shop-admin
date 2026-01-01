// features/orders/hooks/use-orders-total-count.ts
import { useQuery } from "@tanstack/react-query";
import type { Session } from "next-auth";
import type { AxiosInstance } from "axios";

export function useOrdersTotalCount(
  session: Session | null,
  axios: AxiosInstance,
  storeId: string | null = null
) {
  return useQuery({
    queryKey: ["orders", "count", "total", storeId],
    enabled: !!session?.backendTokens?.accessToken && !!storeId,
    queryFn: async (): Promise<number> => {
      const res = await axios.get("/api/orders", {
        params: { limit: 1, offset: 0, status: "pending_payment", storeId },
      });
      return Number(res.data.data.count ?? 0);
    },
    staleTime: 30_000, // optional: reduce spam
  });
}
