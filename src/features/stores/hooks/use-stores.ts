"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";

import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { useCreateMutation } from "@/shared/hooks/use-create-mutation";
import { useUpdateMutation } from "@/shared/hooks/use-update-mutation";
import { fetchStores } from "../api/store.api";
import {
  CreateStorePayload,
  UpdateStorePayload,
  Store,
} from "../types/store.type";

export function useStores() {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();

  // ---------- Fetch stores ----------
  const {
    data: stores,
    isLoading,
    isError,
    error,
  } = useQuery<Store[]>({
    queryKey: ["stores"],
    enabled: !!session?.backendTokens?.accessToken,
    queryFn: async () => {
      return fetchStores(axiosInstance);
    },
  });

  const fetchError =
    error instanceof Error ? error.message : error ? String(error) : null;

  // ---------- Create store (POST /api/stores) ----------
  const createStore = useCreateMutation<CreateStorePayload>({
    endpoint: "/api/stores",
    successMessage: "Store created successfully",
    refetchKey: "stores",
  });

  const updateStore = useUpdateMutation<UpdateStorePayload>({
    endpoint: "/api/stores",
    successMessage: "Store updated successfully",
    refetchKey: "stores",
    method: "PATCH",
  });

  return {
    sessionStatus: status,
    stores: stores ?? [],
    isLoading,
    isError,
    fetchError,
    createStore, // (data, setError, resetForm?, onClose?)
    updateStore, // (data, setError, onClose?)
  };
}
