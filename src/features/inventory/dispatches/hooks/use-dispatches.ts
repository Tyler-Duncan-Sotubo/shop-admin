/* eslint-disable @typescript-eslint/no-explicit-any */
// features/inventory/dispatches/hooks/use-dispatches.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosInstance } from "axios";
import type { Session } from "next-auth";

export type DispatchStatus = "pending" | "dispatched" | "cancelled";

export type DispatchListItem = {
  id: string;
  orderId: string;
  storeId: string;
  status: DispatchStatus;
  requestedByUserId: string | null;
  confirmedByUserId: string | null;
  note: string | null;
  dispatchedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  // joined
  orderNumber: string | null;
  orderStatus: string | null;
  customerName: string | null;
  currency: string | null;
  total: string | null;
  itemCount: number;
  shippingAddress: Record<string, any> | null;
};

export function useListDispatches(
  storeId: string | null,
  status: DispatchStatus | undefined,
  session: Session | null,
  axios: AxiosInstance,
) {
  return useQuery({
    queryKey: ["inventory", "dispatches", storeId, status],
    enabled: !!storeId && !!session?.backendTokens?.accessToken,
    queryFn: async (): Promise<DispatchListItem[]> => {
      const res = await axios.get(`/api/orders/dispatches`, {
        params: { storeId, status },
      });
      return res.data.data;
    },
  });
}

export function useConfirmDispatch(axios: AxiosInstance) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      storeId,
      note,
    }: {
      orderId: string;
      storeId: string;
      note?: string;
    }) => {
      const res = await axios.post(`/api/orders/${orderId}/confirm-dispatch`, {
        storeId,
        note,
      });
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inventory", "dispatches"] });
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
