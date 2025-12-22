"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { fetchInventoryLocations } from "../api/inventory-locations.api";
import { InventoryLocation } from "@/features/stores/types/store-locations.type";

export function useInventoryLocations() {
  const { data: session } = useSession();
  const axiosInstance = useAxiosAuth();

  const { data, isLoading, isError, error } = useQuery<InventoryLocation[]>({
    queryKey: ["inventory-locations"],
    enabled: !!session?.backendTokens?.accessToken,
    queryFn: async () => {
      return fetchInventoryLocations(axiosInstance);
    },
  });

  const fetchError = error instanceof Error ? error.message : null;

  return {
    locations: data ?? [],
    isLoading,
    isError,
    fetchError,
  };
}
