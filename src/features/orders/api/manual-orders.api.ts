import { AxiosInstance } from "axios";
import {
  CreateManualOrderPayload,
  ManualOrder,
} from "../types/manual-order.type";

export async function createManualOrderApi(
  axiosInstance: AxiosInstance,
  data: CreateManualOrderPayload,
  accessToken?: string
): Promise<ManualOrder> {
  const res = await axiosInstance.post("/api/orders/manual", data, {
    headers: {
      Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
    },
  });

  // assuming your backend wraps response like { data: ... }
  return (res.data.data ?? res.data) as ManualOrder;
}

export async function fetchManualOrderApi(
  axiosInstance: AxiosInstance,
  orderId: string
): Promise<ManualOrder> {
  const res = await axiosInstance.get(`/api/orders/${orderId}`);
  return (res.data.data ?? res.data) as ManualOrder;
}
