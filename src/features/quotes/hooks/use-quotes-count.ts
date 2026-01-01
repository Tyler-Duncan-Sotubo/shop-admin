/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQueries } from "@tanstack/react-query";
import type { Session } from "next-auth";
import type { AxiosInstance } from "axios";
import type { QuoteStatus } from "../types/quote.type";

async function fetchQuoteCount(
  axios: AxiosInstance,
  storeId: string | null,
  status?: QuoteStatus,
  includeArchived?: boolean
): Promise<number> {
  // backend requires storeId (DTO: @IsUUID storeId)
  if (!storeId) return 0;

  const params: Record<string, any> = {
    storeId,
    limit: 1,
    offset: 0,
  };

  if (status) params.status = status;

  // If you implement includeArchived on backend, pass it.
  // For "archived" tab, we usually want ONLY archived, so includeArchived isn't needed.
  if (includeArchived !== undefined) params.includeArchived = includeArchived;

  const res = await axios.get("/api/quotes", { params });
  return Number(res.data.data.count ?? 0);
}

export function useQuoteCountsForTabs(
  session: Session | null,
  axios: AxiosInstance,
  storeId: string | null
) {
  const enabled = !!session?.backendTokens?.accessToken && !!storeId;

  const queries = useQueries({
    queries: [
      // All (exclude archived by default, unless you decide otherwise)
      {
        key: "all",
        status: undefined as QuoteStatus | undefined,
        includeArchived: false,
      },

      { key: "new", status: "new" as const },
      { key: "in_progress", status: "in_progress" as const },
      { key: "converted", status: "converted" as const },
      { key: "archived", status: "archived" as const },
    ].map(({ key, status, includeArchived }) => ({
      queryKey: ["quotes", "count", key, storeId],
      enabled,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      queryFn: () => fetchQuoteCount(axios, storeId, status, includeArchived),
    })),
  });

  return {
    all: queries[0].data ?? 0,
    new: queries[1].data ?? 0,
    inProgress: queries[2].data ?? 0,
    converted: queries[3].data ?? 0,
    archived: queries[4].data ?? 0,
  };
}
