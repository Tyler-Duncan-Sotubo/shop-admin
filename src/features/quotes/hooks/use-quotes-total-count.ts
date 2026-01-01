import { useQuery } from "@tanstack/react-query";
import type { Session } from "next-auth";
import type { AxiosInstance } from "axios";

export function useQuotesTotalCount(
  session: Session | null,
  axios: AxiosInstance,
  storeId: string | null = null
) {
  return useQuery({
    queryKey: ["quotes", "count", "total", storeId],
    enabled: !!session?.backendTokens?.accessToken && !!storeId,
    queryFn: async (): Promise<number> => {
      const res = await axios.get("/api/quotes", {
        params: {
          storeId,
          limit: 1,
          offset: 0,
          // show ONLY actionable quotes in sidebar
          status: "new",
        },
      });

      return Number(res.data.data.count ?? 0);
    },
    staleTime: 30_000, // keeps sidebar stable
    refetchOnWindowFocus: false,
  });
}
