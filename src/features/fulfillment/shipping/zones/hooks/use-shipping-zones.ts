import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Session } from "next-auth";
import type { AxiosInstance } from "axios";
import { ShippingZone, CreateZoneInput } from "../types/shipping-zone.type";

/* -----------------------------
 * List Zones
 * ------------------------------*/
export function useGetShippingZones(
  session: Session | null,
  axios: AxiosInstance,
  storeId: string | null
) {
  return useQuery({
    queryKey: ["shipping", "zones", storeId],
    enabled: !!session?.backendTokens?.accessToken,
    queryFn: async (): Promise<ShippingZone[]> => {
      const res = await axios.get("/api/shipping/zones", {
        params: { storeId },
      });
      return res.data.data;
    },
  });
}

/* -----------------------------
 * Create Zone
 * ------------------------------*/
export function useCreateShippingZone(
  session: Session | null,
  axios: AxiosInstance
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateZoneInput) => {
      const res = await axios.post("/api/shipping/zones", input);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shipping", "zones"] });
    },
  });
}

/* -----------------------------
 * Delete Zone
 * ------------------------------*/
export function useDeleteShippingZone(
  session: Session | null,
  axios: AxiosInstance
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (zoneId: string) => {
      await axios.delete(`/api/shipping/zones/${zoneId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shipping", "zones"] });
    },
  });
}
