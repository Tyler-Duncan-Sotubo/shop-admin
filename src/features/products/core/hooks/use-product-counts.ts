/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";

async function fetchTotal(axios: any, params: any) {
  const res = await axios.get("/api/catalog/products", {
    params: { ...params, limit: 1, offset: 0 },
  });
  const data = res.data.data ?? res.data;
  return Number(data.total ?? 0);
}

export function useProductCounts(
  search: string | undefined,
  session?: { backendTokens?: { accessToken?: string } } | null
) {
  const axios = useAxiosAuth();
  const hasToken = Boolean(session?.backendTokens?.accessToken);

  const base = { search };

  const active = useQuery({
    queryKey: ["products-count", "active", base],
    queryFn: () => fetchTotal(axios, { ...base, status: undefined }), // your backend defaults to active
    enabled: hasToken,
    staleTime: 10_000,
  });

  const draft = useQuery({
    queryKey: ["products-count", "draft", base],
    queryFn: () => fetchTotal(axios, { ...base, status: "draft" }),
    enabled: hasToken,
    staleTime: 10_000,
  });

  const archived = useQuery({
    queryKey: ["products-count", "archived", base],
    queryFn: () => fetchTotal(axios, { ...base, status: "archived" }),
    enabled: hasToken,
    staleTime: 10_000,
  });

  return {
    active: active.data ?? 0,
    draft: draft.data ?? 0,
    archived: archived.data ?? 0,
  };
}
