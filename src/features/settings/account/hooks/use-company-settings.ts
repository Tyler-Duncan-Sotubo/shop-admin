// shared/account/hooks/use-company-account.ts

"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { useUpdateMutation } from "@/shared/hooks/use-update-mutation";
import {
  CompanyAccount,
  UpdateCompanyAccountPayload,
} from "../types/company-account.type";
import { fetchCompany } from "../api/company.api";

export function useCompanyAccount() {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();

  const [company, setCompany] = useState<CompanyAccount | null>(null);

  const { isLoading, isError, error } = useQuery({
    queryKey: ["company-account"],
    enabled: !!session?.backendTokens?.accessToken,
    queryFn: async () => {
      const data = await fetchCompany(axiosInstance);
      setCompany(data);
      return data;
    },
  });

  const fetchError =
    error instanceof Error ? error.message : error ? String(error) : null;

  const updateCompany = useUpdateMutation<UpdateCompanyAccountPayload>({
    endpoint: "/api/companies",
    successMessage: "Company updated successfully",
    refetchKey: "company-account",
  });

  return {
    sessionStatus: status,
    company,
    setCompany,
    isLoading,
    isError,
    fetchError,
    updateCompany, // (data, setError?, onClose?) => Promise<any>
  };
}
