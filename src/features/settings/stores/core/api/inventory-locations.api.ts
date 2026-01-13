import { AxiosInstance } from "axios";
import { InventoryLocation } from "@/features/settings/stores/core/types/store-locations.type";

export async function fetchInventoryLocations(
  axiosInstance: AxiosInstance
): Promise<InventoryLocation[]> {
  const res = await axiosInstance.get("/api/inventory/locations");
  return res.data.data as InventoryLocation[];
}
