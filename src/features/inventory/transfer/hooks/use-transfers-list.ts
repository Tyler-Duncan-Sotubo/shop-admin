import { useQuery } from "@tanstack/react-query";
import type { AxiosInstance } from "axios";
import type { Session } from "next-auth";
import { TransferListItem } from "../types/transfer.type";

export function useListTransfers(
  storeId: string | null,
  session: Session | null,
  axios: AxiosInstance
) {
  return useQuery({
    queryKey: ["inventory", "transfers", "list", storeId],
    enabled: !!storeId && !!session?.backendTokens?.accessToken,
    queryFn: async (): Promise<TransferListItem[]> => {
      const res = await axios.get(`/api/inventory/transfers/store/${storeId}`);
      return res.data.data as TransferListItem[];
    },
  });
}
