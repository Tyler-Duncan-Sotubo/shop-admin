import { useQuery } from "@tanstack/react-query";
import type { Session } from "next-auth";
import type { AxiosInstance } from "axios";

export function useDispatchesCount(
  session: Session | null,
  axios: AxiosInstance,
  storeId: string | null = null,
  enabledOverride = true,
) {
  return useQuery({
    queryKey: ["inventory", "dispatches", "count", storeId],
    enabled:
      !!session?.backendTokens?.accessToken && !!storeId && enabledOverride,
    queryFn: async (): Promise<number> => {
      const res = await axios.get("/api/orders/dispatches", {
        params: { storeId, status: "pending" },
      });
      return Number(res.data.data?.length ?? 0);
    },
    staleTime: 30_000,
  });
}
