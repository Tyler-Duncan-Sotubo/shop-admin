import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Session } from "next-auth";
import type { AxiosInstance } from "axios";

export type ShippingOption = {
  id: string;
  name: string;
  states: string[];
  area?: string;
  price: number;
  isActive: boolean;
  sortOrder: number;
};

const QK = (storeId?: string | null) => ["shipping", "options", storeId];

export function useGetShippingOptions(
  session: Session | null,
  axios: AxiosInstance,
  storeId: string | null,
) {
  return useQuery({
    queryKey: QK(storeId),
    enabled: !!session?.backendTokens?.accessToken && !!storeId,
    queryFn: async (): Promise<ShippingOption[]> => {
      const res = await axios.get("/api/shipping/options", {
        params: { storeId },
      });
      return res.data.data;
    },
  });
}

export function useCreateShippingOption(
  session: Session | null,
  axios: AxiosInstance,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      body: { storeId: string } & Omit<ShippingOption, "id" | "sortOrder">,
    ): Promise<ShippingOption> => {
      const res = await axios.post("/api/shipping/options", body);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shipping", "options"] }),
  });
}

export function useUpdateShippingOption(
  session: Session | null,
  axios: AxiosInstance,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...body
    }: { id: string } & Partial<Omit<ShippingOption, "id">>): Promise<ShippingOption> => {
      const res = await axios.put(`/api/shipping/options/${id}`, body);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shipping", "options"] }),
  });
}

export function useDeleteShippingOption(
  session: Session | null,
  axios: AxiosInstance,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await axios.delete(`/api/shipping/options/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shipping", "options"] }),
  });
}

export function useToggleShippingOption(
  session: Session | null,
  axios: AxiosInstance,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<ShippingOption> => {
      const res = await axios.patch(`/api/shipping/options/${id}/toggle`);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shipping", "options"] }),
  });
}
