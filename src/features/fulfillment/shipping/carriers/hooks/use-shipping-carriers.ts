import { useQuery } from "@tanstack/react-query";
import type { Session } from "next-auth";
import { AxiosInstance } from "axios";
import { ShippingCarrier } from "../types/shipping-carrier.type";

export function useGetShippingCarriers(
  session: Session | null,
  axios: AxiosInstance
) {
  return useQuery({
    queryKey: ["shipping", "carriers"],
    enabled: !!session?.backendTokens?.accessToken,
    queryFn: async (): Promise<ShippingCarrier[]> => {
      const res = await axios.get("/api/shipping/carriers");
      return res.data.data;
    },
  });
}
