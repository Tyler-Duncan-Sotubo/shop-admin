import { AxiosInstance } from "axios";
import {
  Store,
  CreateStorePayload,
  UpdateStorePayload,
} from "../types/store.type";

export async function fetchStores(
  axiosInstance: AxiosInstance
): Promise<Store[]> {
  const res = await axiosInstance.get("/api/stores");
  return res.data.data as Store[];
}

export async function createStoreApi(
  axiosInstance: AxiosInstance,
  data: CreateStorePayload,
  accessToken?: string
): Promise<Store> {
  const res = await axiosInstance.post("/api/stores", data, {
    headers: {
      Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
    },
  });
  return res.data as Store;
}

export async function updateStoreApi(
  axiosInstance: AxiosInstance,
  storeId: string,
  data: UpdateStorePayload,
  accessToken?: string
): Promise<Store> {
  const res = await axiosInstance.patch(`/api/stores/${storeId}`, data, {
    headers: {
      Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
    },
  });
  return res.data as Store;
}
