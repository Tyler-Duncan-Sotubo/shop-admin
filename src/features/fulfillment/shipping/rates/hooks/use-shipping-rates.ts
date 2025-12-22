import { useQuery } from "@tanstack/react-query";
import type { Session } from "next-auth";
import type { AxiosInstance } from "axios";
import type { ShippingRate } from "../types/shipping-rate.type";

function toQueryString(args?: {
  zoneId?: string | null;
  storeId?: string | null;
}) {
  const sp = new URLSearchParams();

  if (args?.zoneId) sp.set("zoneId", args.zoneId);
  if (args?.storeId) sp.set("storeId", args.storeId);

  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

export function useGetShippingRates(
  zoneId: string | null,
  storeId: string | null, // ✅ new
  session: Session | null,
  axios: AxiosInstance
) {
  return useQuery({
    queryKey: ["shipping", "rates", zoneId ?? "all", storeId ?? "all"], // ✅ include storeId
    enabled: !!session?.backendTokens?.accessToken,
    queryFn: async (): Promise<ShippingRate[]> => {
      const res = await axios.get(
        `/api/shipping/rates${toQueryString({ zoneId, storeId })}`
      );
      console.log("Fetched shipping rates:", res.data.data);
      return res.data.data as ShippingRate[];
    },
  });
}
