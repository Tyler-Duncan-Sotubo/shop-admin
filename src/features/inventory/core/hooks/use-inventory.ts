import { useQuery } from "@tanstack/react-query";
import type { Session } from "next-auth";
import { AxiosInstance } from "axios";
import {
  InventoryOverviewQuery,
  InventoryOverviewRow,
  StoreLocationRow,
} from "../types/inventory.type";

function toQueryString(query?: InventoryOverviewQuery) {
  const sp = new URLSearchParams();

  if (!query) return "";
  if (query.locationId) sp.set("locationId", query.locationId);
  if (query.search) sp.set("search", query.search);
  if (query.status) sp.set("status", query.status);
  if (query.storeId) sp.set("storeId", query.storeId);

  sp.set("limit", String(query.limit ?? 50));
  sp.set("offset", String(query.offset ?? 0));

  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

export function useGetInventoryOverview(
  query: InventoryOverviewQuery | null,
  session: Session | null,
  axios: AxiosInstance
) {
  return useQuery({
    queryKey: [
      "inventory",
      "overview",
      query?.storeId ?? "no-store",
      query?.locationId ?? "no-location",
      query?.status ?? "any",
      (query?.search ?? "").trim() || "none",
      query?.limit ?? 50,
      query?.offset ?? 0,
    ],
    enabled: !!session?.backendTokens.accessToken && !!query?.storeId,
    queryFn: async (): Promise<InventoryOverviewRow[]> => {
      if (!query?.storeId) return [];

      const url = `/api/inventory/overview${toQueryString(query)}`;

      console.log("[useGetInventoryOverview] fetching", {
        queryKeyStoreId: query.storeId,
        queryKeyLocationId: query.locationId,
        url,
        query,
      });

      const res = await axios.get(url);

      console.log("[useGetInventoryOverview] response", {
        count: res.data?.data?.length ?? 0,
        sample: res.data?.data?.[0] ?? null,
      });

      return res.data.data as InventoryOverviewRow[];
    },
  });
}

export function useGetStoreLocations(
  storeId: string | null,
  session: Session | null,
  axios: AxiosInstance
) {
  return useQuery({
    queryKey: ["inventory", "store", storeId, "locations"],
    enabled: !!storeId && !!session?.backendTokens?.accessToken,
    queryFn: async (): Promise<StoreLocationRow[]> => {
      const res = await axios.get(
        `/api/inventory/stores/${storeId}/locations/options`
      );
      return res.data.data as StoreLocationRow[];
    },
  });
}
