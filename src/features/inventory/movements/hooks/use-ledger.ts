import { useQuery } from "@tanstack/react-query";
import type { Session } from "next-auth";
import type { AxiosInstance } from "axios";
import type {
  LedgerListResponse,
  ListLedgerParams,
} from "../types/ledger.type";
import { LEDGER_TAB_TO_TYPES } from "../constants/ledger-tabs";

export function useGetLedger(
  session: Session | null,
  axios: AxiosInstance,
  params: ListLedgerParams
) {
  const enabled = !!session?.backendTokens?.accessToken;

  return useQuery({
    queryKey: ["inventory", "ledger", params],
    enabled,
    queryFn: async (): Promise<LedgerListResponse> => {
      const types = params.tab ? LEDGER_TAB_TO_TYPES[params.tab] : undefined;

      // If tab maps to multiple types, we’ll request “all” and filter client-side
      // OR you can add backend support for `types[]=...` later.
      const res = await axios.get("/api/inventory/movements", {
        params: {
          limit: params.limit ?? 50,
          offset: params.offset ?? 0,
          locationId: params.locationId || undefined,
          orderId: params.orderId || undefined,
          q: params.q || undefined,
          // backend currently supports `type` only (single); keep undefined for multi
        },
      });

      const data = res.data.data as LedgerListResponse;

      if (!types) return data;

      return {
        ...data,
        rows: data.rows.filter((r) => types.includes(r.type)),
        // count is not perfect when filtering client-side
        // (optional: if you want perfect counts, we’ll extend backend to accept types[])
        count: data.rows.filter((r) => types.includes(r.type)).length,
      };
    },
  });
}
