/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session } from "next-auth";
import type { AxiosInstance } from "axios";
import type {
  ContactEmailRow,
  ContactEmailStatus,
} from "../types/contact-email.type";

export type ListContactEmailsParams = {
  storeId: string | null;
  status?: ContactEmailStatus;
  search?: string;
  limit: number;
  offset: number;
};

type ListResult = {
  rows: ContactEmailRow[];
  count: number;
  limit: number;
  offset: number;
  storeId: string | null;
};

function normalizeListResult(
  payload: any,
  params: ListContactEmailsParams
): ListResult {
  const d = payload?.data ?? payload; // support { data: ... } or raw
  const rows = (d?.rows ?? d?.data ?? []) as ContactEmailRow[];
  const count = Number(d?.count ?? d?.meta?.total ?? rows.length ?? 0);

  return {
    rows: Array.isArray(rows) ? rows : [],
    count: Number.isFinite(count) ? count : 0,
    limit: Number(d?.limit ?? params.limit ?? 50),
    offset: Number(d?.offset ?? params.offset ?? 0),
    storeId: d?.storeId ?? params.storeId ?? null,
  };
}

export function useGetContactEmails(
  session: Session | null,
  axios: AxiosInstance,
  params: ListContactEmailsParams
) {
  return useQuery({
    queryKey: ["contact-emails", params],
    enabled: !!session?.backendTokens?.accessToken,
    queryFn: async (): Promise<ListResult> => {
      const res = await axios.get("/api/mail/contact-messages", { params });

      // IMPORTANT: never return undefined
      return normalizeListResult(res?.data, params);
    },
  });
}

export function useGetContactEmail(
  session: Session | null,
  axios: AxiosInstance,
  id?: string
) {
  return useQuery({
    queryKey: ["contact-email", id],
    enabled: !!session?.backendTokens?.accessToken && !!id,
    queryFn: async (): Promise<ContactEmailRow> => {
      const res = await axios.get(`/api/mail/contact-messages/${id}`);
      const payload = res.data?.data ?? res.data;
      return payload as ContactEmailRow;
    },
  });
}

export function useUpdateContactEmailStatus(axios: AxiosInstance, id?: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (status: ContactEmailStatus) => {
      if (!id) throw new Error("Missing id");
      const res = await axios.patch(`/api/mail/contact-messages/${id}/status`, {
        status,
      });
      return res.data?.data ?? res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contact-email", id] });
      qc.invalidateQueries({ queryKey: ["contact-emails"] });
      qc.invalidateQueries({ queryKey: ["contact-emails", "count"] });
    },
  });
}

async function fetchNewCount(
  axios: AxiosInstance,
  storeId: string | null
): Promise<number> {
  const params: Record<string, any> = {
    limit: 1,
    offset: 0,
    status: "new",
  };

  if (storeId) params.storeId = storeId;

  const res = await axios.get("/api/mail/contact-messages", { params });

  const payload = res.data?.data ?? res.data;
  return Number(payload?.count ?? 0);
}

export function useNewContactEmailCount(
  session: Session | null,
  axios: AxiosInstance,
  storeId: string | null
) {
  const enabled = !!session?.backendTokens?.accessToken;

  return useQuery({
    queryKey: ["contact-emails", "count", "new", storeId],
    enabled,
    staleTime: 30_000, // 30s is perfect for a badge
    refetchOnWindowFocus: true,
    queryFn: () => fetchNewCount(axios, storeId),
  });
}
