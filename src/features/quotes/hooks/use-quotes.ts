// features/quotes/hooks/use-quotes.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session } from "next-auth";
import type { AxiosInstance, AxiosError } from "axios";
import type {
  ListQuotesParams,
  Quote,
  QuoteStatus,
  QuoteWithItems,
} from "../types/quote.type";

type ApiError = {
  status: "error";
  error?: { message?: string };
  message?: string;
};

type ListQuotesResponse = {
  rows: Quote[];
  count: number;
  limit: number;
  offset: number;
};

export function useGetQuotes(
  session: Session | null,
  axios: AxiosInstance,
  params: ListQuotesParams
) {
  return useQuery({
    queryKey: ["quotes", params], // includes storeId/status/search/limit/offset
    enabled: !!session?.backendTokens?.accessToken && !!params.storeId,
    queryFn: async (): Promise<ListQuotesResponse> => {
      const res = await axios.get("/api/quotes", { params });
      return res.data.data;
    },
    // optional but recommended for pagination UX
    placeholderData: (prev) => prev,
  });
}

export function useGetQuote(
  session: Session | null,
  axios: AxiosInstance,
  id?: string
) {
  return useQuery({
    queryKey: ["quotes", id],
    enabled: !!session?.backendTokens?.accessToken && !!id,
    queryFn: async (): Promise<QuoteWithItems> => {
      const res = await axios.get(`/api/quotes/${id}`);
      return res.data.data;
    },
  });
}

export function useUpdateQuoteStatus(
  session: Session | null,
  axios: AxiosInstance
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (args: { id: string; status: QuoteStatus }) => {
      const res = await axios.patch(`/api/quotes/${args.id}`, {
        status: args.status,
      });
      return res.data.data;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["quotes"] });
      qc.invalidateQueries({ queryKey: ["quotes", vars.id] });
    },
    onError: (err) => {
      const e = err as AxiosError<ApiError>;
      const msg =
        e.response?.data?.error?.message ??
        e.response?.data?.message ??
        e.message;
      throw new Error(msg);
    },
  });
}
