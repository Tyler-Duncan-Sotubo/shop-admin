"use client";

import { useQuery } from "@tanstack/react-query";
import type { Session } from "next-auth";
import type { AxiosInstance } from "axios";
import type { Payment, ListPaymentsParams } from "../types/payment.type";

export function useGetPayments(
  params: ListPaymentsParams,
  session: Session | null,
  axios: AxiosInstance
) {
  return useQuery({
    queryKey: [
      "billing",
      "payments",
      "list",
      params.invoiceId ?? "all",
      params.orderId ?? "all",
      params.limit ?? 50,
      params.offset ?? 0,
      params.storeId ?? "all",
    ],
    enabled: !!session?.backendTokens?.accessToken,
    queryFn: async (): Promise<Payment[]> => {
      const res = await axios.get("/api/payments", { params });
      return res.data.data;
    },
  });
}
