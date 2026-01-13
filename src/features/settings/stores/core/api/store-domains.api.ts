// shared/store/api/store-domains.api.ts
import { AxiosInstance } from "axios";
import {
  StoreDomain,
  UpdateStoreDomainsPayload,
} from "../types/store-domain.type";

export async function fetchStoreDomains(
  axiosInstance: AxiosInstance,
  storeId: string
): Promise<StoreDomain[]> {
  const res = await axiosInstance.get(`/api/stores/${storeId}/domains`);
  return res.data.data as StoreDomain[];
}

export async function updateStoreDomainsApi(
  axiosInstance: AxiosInstance,
  storeId: string,
  payload: UpdateStoreDomainsPayload
): Promise<StoreDomain[]> {
  const res = await axiosInstance.patch(
    `/api/stores/${storeId}/domains`,
    payload
  );
  return res.data.data as StoreDomain[];
}
