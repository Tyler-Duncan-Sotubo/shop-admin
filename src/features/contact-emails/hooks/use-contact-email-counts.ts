/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

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

  const res = await axios.get("/api/mail/contact-messages", { params });

  // support { data: { count } } or { count }
  const payload = res.data?.data ?? res.data;
  return Number(payload?.count ?? 0);
}

export function useContactEmailCountsForTabs(
  session: Session | null,
  axios: AxiosInstance,
  storeId: string | null
) {
  const enabled = !!session?.backendTokens?.accessToken;

  const queries = useQueries({
    queries: [
      { key: "all", status: undefined },
      { key: "new", status: "new" },
      { key: "read", status: "read" },
      { key: "archived", status: "archived" },
      { key: "spam", status: "spam" },
    ].map(({ key, status }) => ({
      queryKey: ["contact-emails", "count", key, storeId],
      enabled,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      queryFn: () => fetchCount(axios, storeId, status),
    })),
  });

  return {
    all: queries[0].data ?? 0,
    new: queries[1].data ?? 0,
    read: queries[2].data ?? 0,
    archived: queries[3].data ?? 0,
    spam: queries[4].data ?? 0,
  };
}
