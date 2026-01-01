// features/quotes/hooks/use-convert-quote-to-order.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError, AxiosInstance } from "axios";
import type { Session } from "next-auth";
import { ConvertQuoteFormValues } from "../schema/convert-quote.schema";

type ApiError = {
  status: "error";
  error?: { message?: string };
  message?: string;
};

export function useConvertQuoteToOrder(
  session: Session | null,
  axios: AxiosInstance
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (args: {
      quoteId: string;
      payload: ConvertQuoteFormValues;
    }) => {
      const res = await axios.post(
        `/api/quotes/${args.quoteId}/convert-to-order`,
        args.payload
      );
      return res.data.data as { orderId: string };
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["quotes"] });
      qc.invalidateQueries({ queryKey: ["quotes", vars.quoteId] });
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
