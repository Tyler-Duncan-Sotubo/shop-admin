/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session } from "next-auth";
import type { AxiosError, AxiosInstance } from "axios";
import type {
  ListOrdersParams,
  Order,
  OrderWithItems,
} from "../types/order.type";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type ApiError = {
  status: "error";
  error?: { message?: string };
  message?: string;
};

export function useGetOrders(
  session: Session | null,
  axios: AxiosInstance,
  params: ListOrdersParams,
) {
  return useQuery({
    queryKey: ["orders", params],
    enabled: !!session?.backendTokens?.accessToken,
    queryFn: async (): Promise<{
      rows: Order[];
      count: number;
      limit: number;
      offset: number;
      storeId: string | null;
    }> => {
      const res = await axios.get("/api/orders", { params });
      return res.data.data;
    },
  });
}

export function useGetOrder(
  session: Session | null,
  axios: AxiosInstance,
  id?: string,
) {
  return useQuery({
    queryKey: ["orders", id],
    enabled: !!session?.backendTokens?.accessToken && !!id,
    queryFn: async (): Promise<OrderWithItems> => {
      const res = await axios.get(`/api/orders/${id}`);
      return res.data.data;
    },
  });
}

export function usePayOrder(session: Session | null, axios: AxiosInstance) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await axios.post(`/api/orders/${id}/pay`);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useFulfillOrder(session: Session | null, axios: AxiosInstance) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const res = await axios.post(`/api/orders/${id}/fulfill`);
        return res.data.data;
      } catch (err) {
        const e = err as AxiosError<any>;
        const msg =
          e.response?.data?.error?.message ??
          e.response?.data?.message ??
          e.message;
        throw new Error(msg); // 👈 throw here, not in onError
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useSyncZohoOrder(
  session: Session | null,
  axios: AxiosInstance,
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await axios.post(`/api/orders/${id}/sync-zoho`);
      return res.data.data;
    },
    onSuccess: (_data, id) => {
      // refresh order list + single order
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["orders", id] });
    },
    onError: (err) => {
      const e = err as AxiosError<ApiError>;
      const msg =
        e.response?.data?.error?.message ??
        e.response?.data?.message ??
        e.message;

      throw new Error(msg);
    },
  });
}

export function useConvertToLayBuy(
  session: Session | null,
  axios: AxiosInstance,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) =>
      axios.patch(`/api/orders/${orderId}/lay-buy`).then((res) => res.data),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order converted to lay-buy");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.error?.message ?? "Failed to convert to lay-buy",
      );
    },
  });
}

export function useRequestDispatch(
  session: Session | null,
  axios: AxiosInstance,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      storeId,
      note,
    }: {
      id: string;
      storeId: string;
      note?: string;
    }) => {
      try {
        const res = await axios.post(`/api/orders/${id}/request-dispatch`, {
          storeId,
          note,
        });
        return res.data.data;
      } catch (err) {
        const e = err as AxiosError<any>;
        const msg =
          e.response?.data?.error?.message ??
          e.response?.data?.message ??
          e.message;
        throw new Error(msg);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useConfirmDispatch(
  session: Session | null,
  axios: AxiosInstance,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      storeId,
      note,
    }: {
      id: string;
      storeId: string;
      note?: string;
    }) => {
      try {
        const res = await axios.post(`/api/orders/${id}/confirm-dispatch`, {
          storeId,
          note,
        });
        return res.data.data;
      } catch (err) {
        const e = err as AxiosError<any>;
        const msg =
          e.response?.data?.error?.message ??
          e.response?.data?.message ??
          e.message;
        throw new Error(msg);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useCancelDispatch(
  session: Session | null,
  axios: AxiosInstance,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, note }: { id: string; note?: string }) => {
      try {
        const res = await axios.post(`/api/orders/${id}/cancel-dispatch`, {
          note,
        });
        return res.data.data;
      } catch (err) {
        const e = err as AxiosError<any>;
        const msg =
          e.response?.data?.error?.message ??
          e.response?.data?.message ??
          e.message;
        throw new Error(msg);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useAddOrderItem(session: Session | null, axios: AxiosInstance) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      variantId,
      quantity,
      name,
    }: {
      orderId: string;
      variantId: string;
      quantity: number;
      name?: string;
    }) => {
      try {
        const res = await axios.post(`/api/orders/manual/items`, {
          orderId,
          variantId,
          quantity,
          name,
        });
        return res.data.data;
      } catch (err) {
        const e = err as AxiosError<any>;
        const msg =
          e.response?.data?.error?.message ??
          e.response?.data?.message ??
          e.message;
        throw new Error(msg);
      }
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["orders", vars.orderId] });
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useUpdateOrderItemQty(
  session: Session | null,
  axios: AxiosInstance,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      itemId,
      quantity,
    }: {
      orderId: string;
      itemId: string;
      quantity: number;
    }) => {
      try {
        const res = await axios.patch(
          `/api/orders/${orderId}/items/${itemId}`,
          { quantity },
        );
        return res.data.data;
      } catch (err) {
        const e = err as AxiosError<any>;
        const msg =
          e.response?.data?.error?.message ??
          e.response?.data?.message ??
          e.message;
        throw new Error(msg);
      }
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["orders", vars.orderId] });
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useRemoveOrderItem(
  session: Session | null,
  axios: AxiosInstance,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      itemId,
    }: {
      orderId: string;
      itemId: string;
    }) => {
      try {
        const res = await axios.delete(
          `/api/orders/${orderId}/items/${itemId}`,
        );
        return res.data.data;
      } catch (err) {
        const e = err as AxiosError<any>;
        const msg =
          e.response?.data?.error?.message ??
          e.response?.data?.message ??
          e.message;
        throw new Error(msg);
      }
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["orders", vars.orderId] });
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useCancelOrderWithRefund(
  session: Session | null,
  axios: AxiosInstance,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      forceRefund,
      refundNote,
    }: {
      orderId: string;
      forceRefund?: boolean;
      refundNote?: string;
    }) => {
      try {
        const res = await axios.post(`/api/orders/${orderId}/cancel`, {
          forceRefund,
          refundNote,
        });
        return res.data.data;
      } catch (err) {
        const e = err as AxiosError<any>;
        console.error("Cancel order error", e.response?.data?.error?.message);
        const msg = e.response?.data?.error?.message;
        throw new Error(msg);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (err) => {
      const e = err as AxiosError<any>;
      const msg =
        e.response?.data?.error?.message ??
        e.response?.data?.message ??
        e.message;
      toast.error(msg);
    },
  });
}

export function useDeleteManualOrder(
  session: Session | null,
  axios: AxiosInstance,
) {
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: async (orderId: string) => {
      try {
        const res = await axios.delete(`/api/orders/manual/${orderId}`);
        return res.data.data;
      } catch (err) {
        const e = err as AxiosError<any>;
        const msg =
          e.response?.data?.error?.message ??
          e.response?.data?.message ??
          e.message;
        throw new Error(msg);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      router.push("/sales/orders");
    },
  });
}

export function useApplyDiscount(
  session: Session | null,
  axios: AxiosInstance,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      type,
      value,
    }: {
      orderId: string;
      type: "flat" | "percent";
      value: number;
    }) => {
      try {
        const res = await axios.post(`/api/orders/${orderId}/discount`, {
          type,
          value,
        });
        return res.data.data;
      } catch (err) {
        const e = err as AxiosError<any>;
        const msg =
          e.response?.data?.error?.message ??
          e.response?.data?.message ??
          e.message;
        throw new Error(msg);
      }
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["orders", vars.orderId] });
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useRemoveDiscount(
  session: Session | null,
  axios: AxiosInstance,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string) => {
      try {
        const res = await axios.delete(`/api/orders/${orderId}/discount`);
        return res.data.data;
      } catch (err) {
        const e = err as AxiosError<any>;
        const msg =
          e.response?.data?.error?.message ??
          e.response?.data?.message ??
          e.message;
        throw new Error(msg);
      }
    },
    onSuccess: (_, orderId) => {
      qc.invalidateQueries({ queryKey: ["orders", orderId] });
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useUpdateOrderItem(
  session: Session | null,
  axios: AxiosInstance,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      itemId,
      quantity,
      unitPrice,
    }: {
      orderId: string;
      itemId: string;
      quantity?: number;
      unitPrice?: number;
    }) => {
      try {
        const res = await axios.patch(
          `/api/orders/${orderId}/items/${itemId}`,
          { quantity, unitPrice },
        );
        return res.data.data;
      } catch (err) {
        const e = err as AxiosError<any>;
        throw new Error(
          e.response?.data?.error?.message ??
            e.response?.data?.message ??
            e.message,
        );
      }
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["orders", vars.orderId] });
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useRecordOrderPayment(
  session: Session | null,
  axios: AxiosInstance,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      orderId: string;
      amount: number;
      method: "bank_transfer" | "cash" | "card_manual" | "other";
      reference?: string;
      note?: string;
    }) => {
      try {
        const res = await axios.post(
          `/api/orders/${vars.orderId}/record-payment`,
          {
            amount: vars.amount,
            method: vars.method,
            reference: vars.reference,
            note: vars.note,
          },
        );
        return res.data.data;
      } catch (err) {
        const e = err as AxiosError<any>;
        throw new Error(
          e.response?.data?.error?.message ??
            e.response?.data?.message ??
            e.message,
        );
      }
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["orders", vars.orderId] });
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["billing", "payments", "list"] });
    },
  });
}
