import { AxiosInstance } from "axios";
import { InventoryLocation } from "@/features/stores/types/store-locations.type";

export async function fetchInventoryLocations(
  axiosInstance: AxiosInstance
): Promise<InventoryLocation[]> {
  const res = await axiosInstance.get("/api/inventory/locations");
  return res.data.data as InventoryLocation[];
}
