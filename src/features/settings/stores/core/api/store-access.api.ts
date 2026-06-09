// api/store-access.api.ts
import { AxiosInstance } from "axios";
import { AccessibleStore } from "../types/store-access.type";

export async function fetchAccessibleStores(
  axiosInstance: AxiosInstance,
): Promise<AccessibleStore[]> {
  const res = await axiosInstance.get("/api/stores/accessible-stores");
  return res.data.data as AccessibleStore[];
}
