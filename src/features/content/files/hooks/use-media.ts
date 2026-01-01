// src/features/media/hooks/use-media.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import type { MediaRow } from "../types/media.type";

export type GetMediaParams = {
  storeId?: string;
  search?: string;
  limit?: number;
};

export function useGetMediaFiles(
  params: GetMediaParams = {},
  session?: { backendTokens?: { accessToken?: string } } | null
) {
  const axios = useAxiosAuth();
  const hasToken = Boolean(session?.backendTokens?.accessToken);

  const normalizedParams: GetMediaParams = {
    storeId: params.storeId || undefined,
    search: params.search?.trim() || undefined,
    limit: params.limit ?? 50,
  };

  console.log("Fetching media files with params:", normalizedParams);

  return useQuery({
    queryKey: ["media-files", normalizedParams],
    enabled: hasToken && Boolean(normalizedParams.storeId),
    queryFn: async () => {
      const res = await axios.get("/api/media/list", {
        params: normalizedParams,
      });
      const payload = res.data.data ?? res.data;
      // backend returns rows array (or just array)
      const rows = Array.isArray(payload) ? payload : payload.rows ?? [];
      return rows as MediaRow[];
    },
  });
}
