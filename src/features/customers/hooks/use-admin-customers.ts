import { useQuery } from "@tanstack/react-query";
import type { AxiosInstance } from "axios";
import type { Session } from "next-auth";
import type {
  AdminCustomerRow,
  CustomerDetail,
} from "../types/admin-customer.type";

export type AdminCustomersQuery = {
  search?: string;
  limit?: number;
  offset?: number;
  includeInactive?: boolean;
  storeId?: string | null;
};

function toQueryString(q?: AdminCustomersQuery) {
  const sp = new URLSearchParams();
  if (!q) return "";

  if (q.search) sp.set("search", q.search);
  if (typeof q.includeInactive === "boolean")
    sp.set("includeInactive", String(q.includeInactive));

  sp.set("limit", String(q.limit ?? 50));
  sp.set("offset", String(q.offset ?? 0));

  if (q.storeId) sp.set("storeId", q.storeId);

  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

export function useAdminCustomers(
  query: AdminCustomersQuery,
  session: Session | null,
  axios: AxiosInstance
) {
  return useQuery({
    queryKey: ["admin", "customers", query],
    enabled: !!session?.backendTokens?.accessToken,
    queryFn: async (): Promise<AdminCustomerRow[]> => {
      const res = await axios.get(
        `/api/admin/customers${toQueryString(query)}`
      );
      return res.data.data as AdminCustomerRow[];
    },
  });
}

export function useAdminCustomerDetail(
  customerId: string | null,
  session: Session | null,
  axios: AxiosInstance
) {
  const token = session?.backendTokens?.accessToken;

  return useQuery({
    queryKey: ["customers", "detail", customerId, "bundle"],
    enabled: !!customerId && !!token,
    queryFn: async () => {
      const customerRes = await axios.get(`/api/admin/customers/${customerId}`);

      return customerRes.data.data as CustomerDetail;
    },
  });
}
