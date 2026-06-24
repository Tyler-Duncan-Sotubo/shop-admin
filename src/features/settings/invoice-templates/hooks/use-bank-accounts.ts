"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";

export type BankAccount = {
  id: string;
  companyId: string;
  label: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  tin: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateBankAccountInput = {
  label: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  tin?: string | null;
  sortOrder?: number;
};

export type UpdateBankAccountInput = Partial<CreateBankAccountInput>;

const QK = ["billing", "bank-accounts"] as const;

export function useListBankAccounts() {
  const axios = useAxiosAuth();
  return useQuery({
    queryKey: QK,
    queryFn: async (): Promise<BankAccount[]> => {
      const res = await axios.get("/api/billing/bank-accounts");
      return res.data.data;
    },
  });
}

export function useCreateBankAccount() {
  const axios = useAxiosAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateBankAccountInput): Promise<BankAccount> => {
      const res = await axios.post("/api/billing/bank-accounts", input);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });
}

export function useUpdateBankAccount() {
  const axios = useAxiosAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: UpdateBankAccountInput & { id: string }): Promise<BankAccount> => {
      const res = await axios.patch(`/api/billing/bank-accounts/${id}`, input);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });
}

export function useDeleteBankAccount() {
  const axios = useAxiosAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/billing/bank-accounts/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });
}
