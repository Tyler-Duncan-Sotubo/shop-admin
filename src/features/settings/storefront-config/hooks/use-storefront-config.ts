import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosInstance } from "axios";
import type { Session } from "next-auth";
import type {
  StorefrontConfig,
  UpdateStorefrontConfigPayload,
} from "../types/storefront-config.type";

export function useGetStorefrontConfig(
  session: Session | null,
  axios: AxiosInstance,
  storeId: string | null
) {
  return useQuery({
    queryKey: ["storefrontConfig", storeId],
    enabled: !!session?.backendTokens?.accessToken && !!storeId,
    queryFn: async (): Promise<StorefrontConfig> => {
      const res = await axios.get(`/api/storefront-config/admin/${storeId}`);
      return res.data.data as StorefrontConfig;
    },
  });
}

export function useUpdateStorefrontConfig(
  session: Session | null,
  axios: AxiosInstance,
  storeId: string | null
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: UpdateStorefrontConfigPayload
    ): Promise<StorefrontConfig> => {
      const res = await axios.patch(
        `/api/storefront-config/admin/${storeId}`,
        payload
      );
      return res.data.data as StorefrontConfig;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["storefrontConfig", storeId] });
    },
  });
}
