// features/credits/hooks/use-credits.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session } from "next-auth";
import type { AxiosInstance, AxiosError } from "axios";
import type {
  CreditBalance,
  CreditChannel,
  CreditTransactionsResponse,
  ListCreditTransactionsParams,
} from "../types/credits.types";

type ApiError = {
  status: "error";
  error?: { message?: string };
  message?: string;
};

function getErrorMessage(err: unknown) {
  const e = err as AxiosError<ApiError>;
  return (
    e.response?.data?.error?.message ??
    e.response?.data?.message ??
    e.message ??
    "Something went wrong"
  );
}

export function useGetCreditBalance(
  session: Session | null,
  axios: AxiosInstance,
) {
  return useQuery({
    queryKey: ["credits", "balance"],
    enabled: !!session?.backendTokens?.accessToken,
    queryFn: async (): Promise<CreditBalance> => {
      const res = await axios.get("/api/credits/balance");
      return res.data.data;
    },
  });
}

export function useGetCreditTransactions(
  session: Session | null,
  axios: AxiosInstance,
  params: ListCreditTransactionsParams,
) {
  return useQuery({
    queryKey: ["credits", "transactions", params],
    enabled: !!session?.backendTokens?.accessToken,
    queryFn: async (): Promise<CreditTransactionsResponse> => {
      const res = await axios.get("/api/credits/transactions", { params });
      return res.data.data;
    },
    placeholderData: (prev) => prev,
  });
}

export function useTopUpCredits(session: Session | null, axios: AxiosInstance) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      amount: number;
      channel: CreditChannel;
      note?: string;
    }) => {
      const res = await axios.post("/api/credits/topup", payload);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["credits"] });
    },
    onError: (err) => {
      throw new Error(getErrorMessage(err));
    },
  });
}

export function useAdjustCredits(
  session: Session | null,
  axios: AxiosInstance,
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      amount: number;
      channel: CreditChannel;
      note: string;
    }) => {
      const res = await axios.post("/api/credits/adjust", payload);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["credits"] });
    },
    onError: (err) => {
      throw new Error(getErrorMessage(err));
    },
  });
}
