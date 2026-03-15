import { AxiosInstance } from "axios";
import { InventoryLocation } from "../types/inventory-location.type";

export async function fetchInventoryLocations(
  axiosInstance: AxiosInstance,
  params?: { storeId?: string | null }
): Promise<InventoryLocation[]> {
  const res = await axiosInstance.get("/api/inventory/locations", {
    params: { storeId: params?.storeId ?? null },
  });
  return res.data.data as InventoryLocation[];
}
