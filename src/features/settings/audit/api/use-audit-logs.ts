"use client";

import { isAxiosError } from "@/shared/api/axios";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { useQuery } from "@tanstack/react-query";
import { AuditLog } from "../types/audit.type";
import { useSession } from "next-auth/react";

export function useAuditLogs() {
  const { status, data: session } = useSession();
  const axiosInstance = useAxiosAuth();

  const fetchAuditLogs = async (): Promise<AuditLog[]> => {
    try {
      const res = await axiosInstance.get("/api/audit/logs");
      return res.data.data ?? [];
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        return [];
      }
      throw error;
    }
  };

  const query = useQuery<AuditLog[]>({
    queryKey: ["audit-logs"],
    queryFn: fetchAuditLogs,
    enabled: !!session?.backendTokens?.accessToken,
  });

  return {
    ...query,
    logs: query.data ?? [],
    status,
  };
}
