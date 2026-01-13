/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosInstance } from "axios";
import { StorePaymentMethodRow } from "../types/payment-methods.type";

export function useGetStorePaymentMethods(
  storeId: string | null,
  axios: AxiosInstance,
  enabled: boolean
) {
  return useQuery({
    queryKey: ["payments", "store-methods", "admin", storeId],
    enabled: enabled && !!storeId,
    queryFn: async (): Promise<StorePaymentMethodRow[]> => {
      const res = await axios.get(
        "/api/payments/admin/stores/payment-methods",
        {
          params: { storeId },
        }
      );
      // expect { data: rows } or rows; normalize like you did
      const payload: any = res.data;
      return (payload?.data ?? payload ?? []) as StorePaymentMethodRow[];
    },
  });
}

export function useToggleStorePaymentMethod(axios: AxiosInstance) {
  return useMutation({
    mutationFn: async (payload: {
      storeId: string;
      method: string; // "gateway" | "bank_transfer" ...
      provider?: string | null; // "paystack" | "stripe" | null
      enabled: boolean;
    }) => {
      const res = await axios.post(
        "/api/payments/admin/stores/payment-methods/toggle",
        payload
      );
      return res.data;
    },
  });
}

export function useUpsertGatewayConfig(axios: AxiosInstance) {
  return useMutation({
    mutationFn: async (payload: {
      storeId: string;
      provider: string; // paystack/stripe
      config: Record<string, any>;
      // optional: auto-enable on save
      enabled?: boolean;
    }) => {
      const res = await axios.post(
        "/api/payments/admin/stores/payment-methods/gateway",
        payload
      );
      return res.data;
    },
  });
}

export function useUpsertBankTransferConfig(axios: AxiosInstance) {
  return useMutation({
    mutationFn: async (payload: {
      storeId: string;
      config: Record<string, any>; // { bankDetails: {...} }
      enabled?: boolean;
    }) => {
      const res = await axios.post(
        "/api/payments/admin/stores/payment-methods/bank-transfer",
        payload
      );
      return res.data;
    },
  });
}
