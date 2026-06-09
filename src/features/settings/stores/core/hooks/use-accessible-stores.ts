// hooks/use-accessible-stores.ts
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { fetchAccessibleStores } from "../api/store-access.api";
import { AccessibleStore } from "../types/store-access.type";

// useAccessibleStores — stays as is, for switcher
export function useAccessibleStores() {
  const { data: session } = useSession();
  const axiosInstance = useAxiosAuth();

  return useQuery({
    queryKey: ["accessible-stores"],
    enabled: !!session?.backendTokens?.accessToken,
    queryFn: () => fetchAccessibleStores(axiosInstance),
  });
}

// useUserStores — for edit modal, fetches a specific user's stores
export function useUserStores(userId?: string) {
  const { data: session } = useSession();
  const axiosInstance = useAxiosAuth();

  return useQuery({
    queryKey: ["user-stores", userId],
    enabled: !!session?.backendTokens?.accessToken && !!userId,
    queryFn: async () => {
      const res = await axiosInstance.get(`/api/stores/users/${userId}/stores`);
      return res.data.data as AccessibleStore[];
    },
  });
}
