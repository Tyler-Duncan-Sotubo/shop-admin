/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session } from "next-auth";
import type { AxiosInstance } from "axios";
import type { Invoice, InvoiceWithLines } from "../types/invoice.type";
import type { UpdateInvoiceLineValues } from "../schema/invoice.schema";

/* -----------------------------
 * List invoices (headers only)
 * ------------------------------*/
export function useGetInvoices(
  params: {
    storeId?: string | null;
    status?: string;
    type?: string;
    q?: string;
    limit?: number;
    offset?: number;
  },
  session: Session | null,
  axios: AxiosInstance
) {
  const storeKey = params.storeId ?? "company-default";
  const statusKey = params.status ?? "all";
  const typeKey = params.type ?? "all";
  const qKey = params.q ?? "";

  return useQuery({
    queryKey: [
      "billing",
      "invoices",
      "list",
      storeKey,
      statusKey,
      typeKey,
      qKey,
      params.limit ?? 50,
      params.offset ?? 0,
    ],
    enabled: !!session?.backendTokens?.accessToken,
    queryFn: async (): Promise<Invoice[]> => {
      const res = await axios.get("/api/invoices", { params });
      return res.data.data;
    },
  });
}

/* -----------------------------
 * Get invoice with lines
 * ------------------------------*/
export function useGetInvoiceWithLines(
  invoiceId: string | undefined,
  session: Session | null,
  axios: AxiosInstance
) {
  return useQuery({
    queryKey: ["billing", "invoices", "detail", invoiceId],
    enabled: !!session?.backendTokens?.accessToken && !!invoiceId,
    queryFn: async (): Promise<InvoiceWithLines> => {
      const res = await axios.get(`/api/invoices/${invoiceId}`);
      return res.data.data;
    },
  });
}

/* -----------------------------
 * Update draft invoice line + recalc
 * ------------------------------*/
export function useUpdateInvoiceLine(
  session: Session | null,
  axios: AxiosInstance
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (args: {
      invoiceId: string;
      lineId: string;
      input: UpdateInvoiceLineValues;
    }) => {
      const res = await axios.patch(
        `/api/invoices/${args.invoiceId}/lines/${args.lineId}`,
        args.input
      );
      // assume backend returns { invoice, lines }
      return res.data.data as InvoiceWithLines;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({
        queryKey: ["billing", "invoices", "detail", vars.invoiceId],
      });
      qc.invalidateQueries({ queryKey: ["billing", "invoices", "list"] });
    },
  });
}

/* -----------------------------
 * Issue invoice
 * ------------------------------*/
export function useIssueInvoice(session: Session | null, axios: AxiosInstance) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (args: { invoiceId: string; input: any }) => {
      const res = await axios.post(
        `/api/invoices/${args.invoiceId}/issue`,
        args.input
      );
      return res.data.data as Invoice;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({
        queryKey: ["billing", "invoices", "detail", vars.invoiceId],
      });
      qc.invalidateQueries({ queryKey: ["billing", "invoices", "list"] });
    },
  });
}

export function useUpdateInvoiceDraft(
  session: Session | null,
  axios: AxiosInstance
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (args: {
      invoiceId: string;
      input: { issuedAt?: string | null; dueAt?: string | null };
    }) => {
      const res = await axios.patch(
        `/api/invoices/${args.invoiceId}`,
        args.input
      );
      return res.data.data as Invoice;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({
        queryKey: ["billing", "invoices", "detail", vars.invoiceId],
      });
      qc.invalidateQueries({ queryKey: ["billing", "invoices", "list"] });
    },
  });
}

/* -----------------------------
 * Generate + upload invoice PDF
 * ------------------------------*/

export function useGenerateInvoicePdf(
  session: Session | null,
  axios: AxiosInstance
) {
  return useMutation({
    mutationFn: async (args: {
      invoiceId: string;
      templateId?: string;
      storeId?: string;
    }) => {
      const res = await axios.post(
        `/api/invoice-templates/${args.invoiceId}/pdf`,
        undefined, // 👈 NO BODY
        {
          params: {
            templateId: args.templateId,
            storeId: args.storeId,
          },
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return res.data.data as {
        pdfUrl: string;
        fileName: string;
        generatedInvoiceId: string;
      };
    },
  });
}

/* -----------------------------
 * Generate / get public invoice link
 * ------------------------------*/
export function useGenerateInvoicePublicLink(
  session: Session | null,
  axios: AxiosInstance
) {
  return useMutation({
    mutationFn: async (args: { invoiceId: string }) => {
      const res = await axios.post(
        `/api/invoices/${args.invoiceId}/public-link`
      );

      // returns invoice_public_links row
      return res.data.data as {
        token: string;
        invoiceId: string;
        enabled: boolean;
      };
    },
  });
}
