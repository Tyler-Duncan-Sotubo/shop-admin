// features/quotes/hooks/use-send-quote-to-zoho.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError, AxiosInstance } from "axios";
import type { Session } from "next-auth";

type ApiError = {
  status: "error";
  error?: { message?: string };
  message?: string;
};

type SendToZohoResponse = {
  // adjust to match your API's actual shape if needed
  // e.g. { zohoId: string } or { success: true }
  [key: string]: unknown;
};

export function useSendQuoteToZoho(
  session: Session | null,
  axios: AxiosInstance,
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (args: { quoteId: string }) => {
      // Nest endpoint: POST /quotes/:quoteId/send-to-zoho
      // If your Next API proxies to Nest, keep /api prefix like your other hook.
      const res = await axios.post(`/api/quotes/${args.quoteId}/send-to-zoho`);
      return (res.data?.data ?? res.data) as SendToZohoResponse;
    },
    onSuccess: (_data, vars) => {
      // keep cache in sync
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
