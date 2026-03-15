"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { useCreateMutation } from "@/shared/hooks/use-create-mutation";
import { fetchInventoryLocations } from "../api/inventory-locations.api";
import {
  InventoryLocation,
  CreateInventoryLocationPayload,
} from "../types/inventory-location.type";
import { useStoreScope } from "@/lib/providers/store-scope-provider";

export function useInventoryLocations() {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();
  const { activeStoreId } = useStoreScope();
  const storeKey = activeStoreId ?? "company-default";

  const {
    data: locations,
    isLoading,
    isError,
    error,
  } = useQuery<InventoryLocation[]>({
    queryKey: ["inventory-locations", storeKey],
    enabled: !!session?.backendTokens?.accessToken && !!activeStoreId,
    queryFn: () =>
      fetchInventoryLocations(axiosInstance, { storeId: activeStoreId }),
  });

  const fetchError =
    error instanceof Error ? error.message : error ? String(error) : null;

  const createLocation = useCreateMutation<CreateInventoryLocationPayload>({
    endpoint: "/api/inventory/locations",
    successMessage: "Location created successfully",
    refetchKey: "inventory-locations",
  });

  return {
    sessionStatus: status,
    locations: locations ?? [],
    isLoading,
    isError,
    fetchError,
    createLocation,
  };
}
