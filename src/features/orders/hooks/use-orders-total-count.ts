// features/orders/hooks/use-orders-total-count.ts
import { useQuery } from "@tanstack/react-query";
import type { Session } from "next-auth";
import type { AxiosInstance } from "axios";

export function useOrdersTotalCount(
  session: Session | null,
  axios: AxiosInstance,
  storeId: string | null = null,
  enabledOverride = true,
) {
  return useQuery({
    queryKey: ["orders", "count", "total", storeId],
    enabled:
      !!session?.backendTokens?.accessToken && !!storeId && enabledOverride,
    queryFn: async (): Promise<number> => {
      const statuses = ["pending_payment"];

      const results = await Promise.all(
        statuses.map((status) =>
          axios
            .get("/api/orders", {
              params: { limit: 1, offset: 0, status, storeId },
            })
            .then((res) => Number(res.data.data.count ?? 0)),
        ),
      );

      return results.reduce((sum, count) => sum + count, 0);
    },
    staleTime: 30_000,
  });
}
