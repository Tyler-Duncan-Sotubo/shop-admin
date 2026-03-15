import { InventoryLocation } from "@/features/settings/inventory/locations/types/inventory-location.type";
import { AxiosInstance } from "axios";

export async function fetchStoreLocations(
  axiosInstance: AxiosInstance,
  storeId: string,
): Promise<InventoryLocation[]> {
  const res = await axiosInstance.get(
    `/api/inventory/stores/${storeId}/locations`,
  );
  return res.data.data as InventoryLocation[];
}
