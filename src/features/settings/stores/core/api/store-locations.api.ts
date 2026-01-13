import { AxiosInstance } from "axios";
import { InventoryLocation } from "@/features/inventory/locations/types/inventory-location.type";

export async function fetchStoreLocations(
  axiosInstance: AxiosInstance,
  storeId: string
): Promise<InventoryLocation[]> {
  const res = await axiosInstance.get(
    `/api/inventory/stores/${storeId}/locations`
  );
  return res.data.data as InventoryLocation[];
}
