/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosInstance } from "axios";
import type { Session } from "next-auth";
import { toast } from "sonner";
import type {
  AnalyticsTag,
  CreateAnalyticsTagInput,
} from "../types/analytics-tag.type";

export function useGetAnalyticsTags(
  session: Session | null,
  axios: AxiosInstance
) {
  return useQuery({
    queryKey: ["analytics", "tags", "admin"],
    enabled: !!session?.backendTokens?.accessToken,
    queryFn: async (): Promise<AnalyticsTag[]> => {
      const res = await axios.get("/api/analytics/tags/admin");
      // backend: { data: tags }
      return res.data.data;
    },
  });
}

export function useCreateAnalyticsTag(
  session: Session | null,
  axios: AxiosInstance
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateAnalyticsTagInput) => {
      const res = await axios.post("/api/analytics/tags/admin", input);
      // backend: { data: { id, token, snippet, ... } }
      return res.data.data as AnalyticsTag & { snippet?: string };
    },
    onSuccess: () => {
      toast.success("Analytics tag created");
      qc.invalidateQueries({ queryKey: ["analytics", "tags", "admin"] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? "Failed to create tag";
      toast.error(msg);
    },
  });
}

export function useRevokeAnalyticsTag(
  session: Session | null,
  axios: AxiosInstance
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (tagId: string) => {
      const res = await axios.patch(
        `/api/analytics/tags/admin/${tagId}/revoke`
      );
      return res.data.data as AnalyticsTag;
    },
    onSuccess: () => {
      toast.success("Tag revoked");
      qc.invalidateQueries({ queryKey: ["analytics", "tags", "admin"] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? "Failed to revoke tag";
      toast.error(msg);
    },
  });
}
