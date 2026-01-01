"use client";

import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { useCreateMutation } from "@/shared/hooks/use-create-mutation";
import { CreateManualOrderPayload } from "../types/manual-order.type";

export function useManualOrders(orderId?: string) {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();

  const createManualOrder = useCreateMutation<CreateManualOrderPayload>({
    endpoint: "/api/orders/manual",
    successMessage: "Manual order created",
    refetchKey: "orders", // or "manualOrders" depending on your query keys
  });

  const createManualPayment = useCreateMutation<CreateManualOrderPayload>({
    endpoint: `/api/orders/manual/${orderId}/submit-for-payment`,
    successMessage: "Manual payment created",
    refetchKey: "orders", // or "manualPayments" depending on your query keys
  });

  return {
    sessionStatus: status,
    session,
    axiosInstance,
    createManualOrder,
    createManualPayment,
  };
}
