"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import {
  fetchStoreDomains,
  updateStoreDomainsApi,
} from "../api/store-domains.api";
import {
  StoreDomain,
  UpdateStoreDomainsPayload,
} from "../types/store-domain.type";

export function useStoreDomains(storeId?: string | null) {
  const axiosInstance = useAxiosAuth();
  const qc = useQueryClient();

  const query = useQuery<StoreDomain[]>({
    queryKey: ["store-domains", storeId],
    enabled: !!storeId,
    queryFn: async () => fetchStoreDomains(axiosInstance, storeId as string),
  });

  const mutation = useMutation({
    mutationFn: async (payload: UpdateStoreDomainsPayload) =>
      updateStoreDomainsApi(axiosInstance, storeId as string, payload),
    onSuccess: async () => {
      // refresh domains
      await qc.invalidateQueries({ queryKey: ["store-domains", storeId] });
      // refresh stores list/summary if you display domains there
      await qc.invalidateQueries({ queryKey: ["stores"] });
    },
  });

  const fetchError =
    query.error instanceof Error
      ? query.error.message
      : query.error
      ? String(query.error)
      : null;

  return {
    domains: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    fetchError,
    refetch: query.refetch,

    updateDomains: mutation.mutateAsync,
    isSaving: mutation.isPending,
    saveError:
      mutation.error instanceof Error
        ? mutation.error.message
        : mutation.error
        ? String(mutation.error)
        : null,
  };
}
