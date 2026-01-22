// hooks/use-user-roles.ts (UPDATED)
"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { fetchUserRoles } from "../api/users.api";

export function useUserRoles(enabled: boolean) {
  const axios = useAxiosAuth();
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["roles"],
    queryFn: async () => fetchUserRoles(axios),
    enabled: enabled && !!session?.backendTokens?.accessToken, // ✅ caller controls
    refetchOnMount: false,
  });
}
