"use client";

import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { useCreateMutation } from "@/shared/hooks/use-create-mutation";
import { useQuery } from "@tanstack/react-query";
import { CreateManualOrderPayload } from "../types/manual-order.type";
import { useUpdateMutation } from "@/shared/hooks/use-update-mutation";

export function useManualOrders(
  orderId?: string,
  message?: string,
  canReadOrders?: boolean,
) {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();

  const createManualOrder = useCreateMutation<CreateManualOrderPayload>({
    endpoint: "/api/orders/manual",
    successMessage: "Manual order created",
    refetchKey: "orders",
  });

  const createManualPayment = useUpdateMutation<CreateManualOrderPayload>({
    endpoint: `/api/orders/manual/${orderId}/submit-for-payment`,
    successMessage: message,
    refetchKey: "orders",
  });

  const stockCheck = useQuery({
    queryKey: ["orders", "stock-check", orderId],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/api/orders/manual/${orderId}/stock-check`,
      );
      return res.data.data as {
        ready: boolean;
        fulfillmentModel: "stock_first" | "payment_first";
        items: {
          itemId: string;
          variantId: string;
          name: string;
          requested: number;
          sellable: number;
          sufficient: boolean;
          shortfall: number;
        }[];
      };
    },
    enabled: !!orderId && status === "authenticated" && canReadOrders,
    staleTime: 30_000, // re-fetch after 30s — stock changes frequently
  });

  return {
    sessionStatus: status,
    session,
    axiosInstance,
    createManualOrder,
    createManualPayment,
    stockCheck,
  };
}
