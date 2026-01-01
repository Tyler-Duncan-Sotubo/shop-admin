import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session } from "next-auth";
import type { AxiosError, AxiosInstance } from "axios";
import type {
  ListOrdersParams,
  Order,
  OrderWithItems,
} from "../types/order.type";

type ApiError = {
  status: "error";
  error?: { message?: string };
  message?: string;
};

export function useGetOrders(
  session: Session | null,
  axios: AxiosInstance,
  params: ListOrdersParams
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
  id?: string
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

export function useCancelOrder(session: Session | null, axios: AxiosInstance) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await axios.post(`/api/orders/${id}/cancel`);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
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

export function useFulfillOrder(session: Session | null, axios: AxiosInstance) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await axios.post(`/api/orders/${id}/fulfill`);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
