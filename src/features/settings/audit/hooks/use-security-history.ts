"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth"; // use your shared one
import { fetchSecurityHistory } from "../api/security-history.api";
import { AuditLog } from "../types/audit.type";

export function useSecurityHistory(enabled: boolean) {
  const { data: session, status } = useSession();
  const axios = useAxiosAuth();

  const query = useQuery<AuditLog[]>({
    queryKey: ["audit", "authentication-logs"],
    queryFn: async () => fetchSecurityHistory(axios),
    enabled: enabled && !!session?.backendTokens?.accessToken,
    refetchOnMount: true,
  });

  return {
    sessionStatus: status,
    ...query,
  };
}
