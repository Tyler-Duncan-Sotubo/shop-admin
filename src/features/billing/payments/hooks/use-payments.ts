/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Session } from "next-auth";
import type { AxiosInstance } from "axios";
import type { Payment, ListPaymentsParams } from "../types/payment.type";

export type PaymentEvidence = {
  id: string;
  companyId: string;
  paymentId: string;
  url: string;
  fileName: string;
  mimeType: string;
  sizeBytes?: number | null;
  uploadedByUserId?: string | null;
  note?: string | null;
  createdAt?: string;
};

export type PendingOrderPaymentReviewItem = {
  paymentId: string;
  orderId: string | null;
  amountMinor: number;
  currency: string;
  method: string;
  status: string;
  reference?: string | null;
  createdAt?: string;
  orderNumber?: string | null;
  orderStatus?: string | null;
};

export type FinalizePendingOrderBankTransferInput = {
  paymentId: string;
  reference?: string | null;
  evidenceRequired?: boolean;
};

export function useGetPayments(
  params: ListPaymentsParams,
  session: Session | null,
  axios: AxiosInstance,
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

export function useGetPendingOrderPaymentsForReview(
  session: Session | null,
  axios: AxiosInstance,
) {
  return useQuery({
    queryKey: ["billing", "payments", "order-bank-transfer", "pending-review"],
    enabled: !!session?.backendTokens?.accessToken,
    queryFn: async (): Promise<PendingOrderPaymentReviewItem[]> => {
      const res = await axios.get(
        "/api/payments/admin/orders/bank-transfer/pending-review",
      );
      return res.data.data;
    },
  });
}

export function useGetPendingOrderPayment(
  paymentId: string | undefined,
  session: Session | null,
  axios: AxiosInstance,
) {
  return useQuery({
    queryKey: ["payment-review", paymentId],
    enabled: !!paymentId && !!session?.backendTokens?.accessToken,
    queryFn: async () => {
      const res = await axios.get(`/api/payments/${paymentId}/review`);
      return res.data.data;
    },
  });
}

export function useGetPaymentEvidence(
  paymentId: string | undefined,
  session: Session | null,
  axios: AxiosInstance,
) {
  return useQuery({
    queryKey: ["billing", "payments", "evidence", paymentId ?? "none"],
    enabled: !!session?.backendTokens?.accessToken && !!paymentId,
    queryFn: async (): Promise<PaymentEvidence[]> => {
      const res = await axios.get(`/api/payments/${paymentId}/evidence`);
      return res.data.data;
    },
  });
}

export function useFinalizePendingOrderBankTransferPayment(
  session: Session | null,
  axios: AxiosInstance,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: FinalizePendingOrderBankTransferInput,
    ): Promise<any> => {
      const res = await axios.post(
        "/api/payments/admin/orders/bank-transfer/finalize",
        payload,
      );
      return res.data.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          "billing",
          "payments",
          "order-bank-transfer",
          "pending-review",
        ],
      });

      queryClient.invalidateQueries({
        queryKey: ["billing", "payments", "evidence", variables.paymentId],
      });

      queryClient.invalidateQueries({
        queryKey: ["billing", "payments", "list"],
      });
    },
  });
}
