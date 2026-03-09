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

type CreateQuoteItemInput = {
  productId?: string | null;
  variantId?: string | null;
  name: string;
  variantLabel?: string | null;
  attributes?: Record<string, unknown> | null;
  imageUrl?: string | null;
  quantity?: number;
};

type CreateQuoteInput = {
  storeId: string;
  customerEmail: string;
  customerNote?: string | null;
  meta?: Record<string, unknown> | null;
  expiresAt?: string | null;
  items: CreateQuoteItemInput[];
};

type UpdateQuoteInput = {
  id: string;
  customerEmail?: string;
  customerNote?: string | null;
  meta?: Record<string, unknown> | null;
  status?: QuoteStatus;
};

type AddQuoteItemsInput = {
  quoteId: string;
  items: {
    variantId?: string | null;
    quantity?: number;
  }[];
};

type UpdateQuoteItemsInput = {
  quoteId: string;
  items: {
    itemId: string;
    quantity: number;
  }[];
};

type RemoveQuoteItemsInput = {
  quoteId: string;
  itemIds: string[];
};

function getErrorMessage(err: unknown) {
  const e = err as AxiosError<ApiError>;
  return (
    e.response?.data?.error?.message ??
    e.response?.data?.message ??
    e.message ??
    "Something went wrong"
  );
}

export function useGetQuotes(
  session: Session | null,
  axios: AxiosInstance,
  params: ListQuotesParams,
) {
  return useQuery({
    queryKey: ["quotes", params],
    enabled: !!session?.backendTokens?.accessToken && !!params.storeId,
    queryFn: async (): Promise<ListQuotesResponse> => {
      const res = await axios.get("/api/quotes", { params });
      return res.data.data;
    },
    placeholderData: (prev) => prev,
  });
}

export function useGetQuote(
  session: Session | null,
  axios: AxiosInstance,
  id?: string,
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

export function useCreateQuote(session: Session | null, axios: AxiosInstance) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateQuoteInput): Promise<Quote> => {
      const res = await axios.post("/api/quotes", payload);
      return res.data.data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["quotes"] });
      qc.invalidateQueries({ queryKey: ["quotes", data.id] });
    },
    onError: (err) => {
      throw new Error(getErrorMessage(err));
    },
  });
}

export function useUpdateQuote(session: Session | null, axios: AxiosInstance) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateQuoteInput): Promise<Quote> => {
      const { id, ...body } = payload;
      const res = await axios.patch(`/api/quotes/${id}`, body);
      return res.data.data;
    },
    onSuccess: (data, vars) => {
      qc.invalidateQueries({ queryKey: ["quotes"] });
      qc.invalidateQueries({ queryKey: ["quotes", vars.id] });
    },
    onError: (err) => {
      throw new Error(getErrorMessage(err));
    },
  });
}

export function useUpdateQuoteStatus(
  session: Session | null,
  axios: AxiosInstance,
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
      throw new Error(getErrorMessage(err));
    },
  });
}

export function useAddQuoteItems(
  session: Session | null,
  axios: AxiosInstance,
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AddQuoteItemsInput): Promise<Quote> => {
      const res = await axios.post(`/api/quotes/${payload.quoteId}/items`, {
        items: payload.items,
      });
      return res.data.data;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["quotes"] });
      qc.invalidateQueries({ queryKey: ["quotes", vars.quoteId] });
    },
    onError: (err) => {
      throw new Error(getErrorMessage(err));
    },
  });
}

export function useUpdateQuoteItems(
  session: Session | null,
  axios: AxiosInstance,
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateQuoteItemsInput): Promise<Quote> => {
      const res = await axios.patch(`/api/quotes/${payload.quoteId}/items`, {
        items: payload.items,
      });
      return res.data.data;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["quotes"] });
      qc.invalidateQueries({ queryKey: ["quotes", vars.quoteId] });
    },
    onError: (err) => {
      throw new Error(getErrorMessage(err));
    },
  });
}

export function useRemoveQuoteItems(
  session: Session | null,
  axios: AxiosInstance,
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: RemoveQuoteItemsInput): Promise<Quote> => {
      const res = await axios.delete(`/api/quotes/${payload.quoteId}/items`, {
        data: {
          itemIds: payload.itemIds,
        },
      });
      return res.data.data;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["quotes"] });
      qc.invalidateQueries({ queryKey: ["quotes", vars.quoteId] });
    },
    onError: (err) => {
      throw new Error(getErrorMessage(err));
    },
  });
}

export function useDeleteQuote(session: Session | null, axios: AxiosInstance) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<{ success: true }> => {
      const res = await axios.delete(`/api/quotes/${id}`);
      return res.data.data;
    },
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ["quotes"] });
      qc.removeQueries({ queryKey: ["quotes", id] });
    },
    onError: (err) => {
      throw new Error(getErrorMessage(err));
    },
  });
}
