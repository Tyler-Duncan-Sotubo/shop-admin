import { useQuery } from "@tanstack/react-query";
import type { Session } from "next-auth";
import type { AxiosInstance } from "axios";
import type { ShippingRateTier } from "../types/shipping-rate-tier.type";

export function useGetRateTiers(
  rateId: string,
  session: Session | null,
  axios: AxiosInstance
) {
  return useQuery({
    queryKey: ["shipping", "rates", rateId, "tiers"],
    enabled: !!rateId && !!session?.backendTokens?.accessToken,
    queryFn: async (): Promise<ShippingRateTier[]> => {
      const res = await axios.get(`/api/shipping/rates/${rateId}/tiers`);
      return res.data.data as ShippingRateTier[];
    },
  });
}
