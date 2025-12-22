import { useQuery } from "@tanstack/react-query";
import type { Session } from "next-auth";
import type { AxiosInstance } from "axios";
import type {
  ListCartsQuery,
  ListCartsResponse,
  CartDetail,
  CartItemRow,
} from "../types/cart.type";

function toQueryString(query?: ListCartsQuery) {
  const sp = new URLSearchParams();
  if (!query) return "";

  if (query.status) sp.set("status", query.status);
  if (query.search) sp.set("search", query.search);
  if (query.customerId) sp.set("customerId", query.customerId);

  sp.set("limit", String(query.limit ?? 50));
  sp.set("offset", String(query.offset ?? 0));

  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

export function useGetCarts(
  query: ListCartsQuery,
  session: Session | null,
  axios: AxiosInstance
) {
  return useQuery({
    queryKey: ["carts", "list", query],
    enabled: !!session?.backendTokens?.accessToken,
    queryFn: async (): Promise<ListCartsResponse> => {
      const res = await axios.get(`/api/carts${toQueryString(query)}`);
      return res.data.data as ListCartsResponse;
    },
  });
}

export function useGetCart(
  cartId: string | null,
  session: Session | null,
  axios: AxiosInstance
) {
  return useQuery({
    queryKey: ["carts", "detail", cartId],
    enabled: !!cartId && !!session?.backendTokens?.accessToken,
    queryFn: async (): Promise<CartDetail> => {
      const res = await axios.get(`/api/carts/${cartId}`);
      return res.data.data as CartDetail;
    },
  });
}

export function useGetCartItems(
  cartId: string | null,
  session: Session | null,
  axios: AxiosInstance
) {
  return useQuery({
    queryKey: ["carts", "items", cartId],
    enabled: !!cartId && !!session?.backendTokens?.accessToken,
    queryFn: async (): Promise<CartItemRow[]> => {
      const res = await axios.get(`/api/carts/${cartId}/items`);
      return res.data.data as CartItemRow[];
    },
  });
}
