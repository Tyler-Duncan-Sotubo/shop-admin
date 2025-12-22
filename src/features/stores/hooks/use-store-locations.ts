"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { fetchStoreLocations } from "../api/store-locations.api";
import { StoreLocation } from "../types/store-locations.type";

export function useStoreLocations(storeId: string) {
  const { data: session } = useSession();
  const axiosInstance = useAxiosAuth();

  // ---------- Fetch store ↔ location mappings ----------
  const { data, isLoading, isError, error } = useQuery<StoreLocation[]>({
    queryKey: ["store-locations", storeId],
    enabled: !!session?.backendTokens?.accessToken && !!storeId,
    queryFn: async () => {
      return fetchStoreLocations(axiosInstance, storeId);
    },
  });

  const fetchError = error instanceof Error ? error.message : null;

  return {
    storeLocations: data ?? [],
    assignedLocationIds: (data ?? []).map((l) => l.locationId),
    isLoading,
    isError,
    fetchError,
  };
}
