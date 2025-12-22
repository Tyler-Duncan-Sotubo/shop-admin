import { useQuery } from "@tanstack/react-query";
import type { Session } from "next-auth";
import type { AxiosInstance } from "axios";
import { ShippingZoneLocation } from "../types/shipping-zone-location.type";

/* -----------------------------
 * List zone locations
 * ------------------------------*/
export function useGetZoneLocations(
  zoneId: string,
  session: Session | null,
  axios: AxiosInstance
) {
  return useQuery({
    queryKey: ["shipping", "zones", zoneId, "locations"],
    enabled: !!zoneId && !!session?.backendTokens?.accessToken,
    queryFn: async (): Promise<ShippingZoneLocation[]> => {
      const res = await axios.get(`/api/shipping/zones/${zoneId}/locations`);
      return res.data.data;
    },
  });
}
