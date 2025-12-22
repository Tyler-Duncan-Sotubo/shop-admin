"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { fetchUserRoles } from "../api/users.api";

export function useUserRoles(open: boolean) {
  const axios = useAxiosAuth();
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["roles"],
    queryFn: async () => fetchUserRoles(axios),
    enabled: open && !!session?.backendTokens?.accessToken, // ✅ only fetch when modal open
    refetchOnMount: false,
    staleTime: 1000 * 60 * 10, // ✅ cache for 10 mins
  });
}
