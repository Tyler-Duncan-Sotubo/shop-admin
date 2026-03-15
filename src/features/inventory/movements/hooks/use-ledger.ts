import { useQuery } from "@tanstack/react-query";
import type { Session } from "next-auth";
import type { AxiosInstance } from "axios";
import type {
  LedgerListResponse,
  ListLedgerParams,
} from "../types/ledger.type";
import type { LedgerTab } from "../constants/ledger-tabs";
import { LEDGER_TAB_TO_TYPES } from "../constants/ledger-tabs";

export type LedgerQueryParams = Omit<ListLedgerParams, "tab"> & {
  tab?: LedgerTab;
};

export function useGetLedger(
  session: Session | null,
  axios: AxiosInstance,
  params: LedgerQueryParams,
) {
  const enabled = !!session?.backendTokens?.accessToken;

  return useQuery({
    queryKey: ["inventory", "ledger", params],
    enabled,
    queryFn: async (): Promise<LedgerListResponse> => {
      const types = params.tab ? LEDGER_TAB_TO_TYPES[params.tab] : undefined;

      const res = await axios.get("/api/inventory/movements", {
        params: {
          limit: params.limit ?? 50,
          offset: params.offset ?? 0,
          locationId: params.locationId || undefined,
          orderId: params.orderId || undefined,
          q: params.q || undefined,
          // pass multiple types as repeated query params: ?type[]=fulfill&type[]=pos_deduct
          "type[]": types ?? undefined,
        },
      });

      return res.data.data as LedgerListResponse;
    },
  });
}
