/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMutation } from "@tanstack/react-query";
import type { AxiosInstance } from "axios";
import { toast } from "sonner";

type ReceiptPdfResponse = { pdfUrl: string; storageKey?: string };

export function useGeneratePaymentReceiptPdf(axios: AxiosInstance) {
  return useMutation({
    mutationFn: async (paymentId: string): Promise<ReceiptPdfResponse> => {
      const res = await axios.post(
        `/api/payments/admin/${paymentId}/receipt/pdf`
      );

      const payload = res.data as any;
      const data: ReceiptPdfResponse | undefined = payload?.pdfUrl
        ? payload
        : payload?.data;

      if (!data?.pdfUrl) {
        throw new Error("Receipt PDF URL missing from response");
      }

      return data;
    },

    onSuccess: ({ pdfUrl }) => {
      window.open(pdfUrl, "_blank", "noopener,noreferrer");
      toast.success("Receipt opened in a new tab");
    },

    onError: (error: any) => {
      const message =
        error?.response?.data?.message ??
        error?.message ??
        "Failed to generate payment receipt";
      toast.error(message);
    },
  });
}
