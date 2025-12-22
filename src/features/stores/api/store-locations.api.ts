import { AxiosInstance } from "axios";
import { StoreLocation } from "../types/store-locations.type";

export async function fetchStoreLocations(
  axiosInstance: AxiosInstance,
  storeId: string
): Promise<StoreLocation[]> {
  const res = await axiosInstance.get(
    `/api/inventory/stores/${storeId}/locations`
  );
  return res.data.data as StoreLocation[];
}
