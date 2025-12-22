import { useQuery } from "@tanstack/react-query";
import type { AxiosInstance } from "axios";
import type { Session } from "next-auth";
import type { StoreTransferHistoryRow } from "../types/transfer-history.type";

export function useStoreTransferHistory(
  storeId: string | null,
  session: Session | null,
  axios: AxiosInstance
) {
  return useQuery({
    queryKey: ["inventory", "stores", storeId, "transfers", "history"],
    enabled: !!storeId && !!session?.backendTokens?.accessToken,
    queryFn: async (): Promise<StoreTransferHistoryRow[]> => {
      const res = await axios.get(
        `/api/inventory/stores/${storeId}/transfers/history`
      );
      return res.data.data as StoreTransferHistoryRow[];
    },
  });
}
