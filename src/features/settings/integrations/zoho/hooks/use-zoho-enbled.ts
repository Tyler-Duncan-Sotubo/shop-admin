"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";

export function useZohoEnabled(storeId: string | null) {
  const { data: session } = useSession();
  const axiosInstance = useAxiosAuth();

  const { data, isLoading, isError, error } = useQuery<boolean>({
    queryKey: ["zoho-enabled", storeId],
    enabled: !!session?.backendTokens?.accessToken && !!storeId,
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/api/integrations/zoho/admin/enabled?storeId=${storeId}`,
      );
      return res.data.data as boolean;
    },
    refetchOnMount: true,
  });

  const fetchError =
    error instanceof Error ? error.message : error ? String(error) : null;

  console.log("Zoho enabled:", data);

  return {
    isEnabled: data ?? false,
    isLoading,
    isError,
    fetchError,
  };
}
