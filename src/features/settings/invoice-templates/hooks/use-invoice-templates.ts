import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session } from "next-auth";
import type { AxiosInstance } from "axios";
import type {
  InvoiceTemplate,
  InvoiceBranding,
  PreviewHtmlResponse,
} from "../types/invoice-template.type";
import type { InvoiceBrandingValues } from "../schema/invoice-branding.schema";

/* -----------------------------
 * List system templates
 * ------------------------------*/
export function useListInvoiceTemplates(
  session: Session | null,
  axios: AxiosInstance
) {
  return useQuery({
    queryKey: ["billing", "invoiceTemplates", "system"],
    enabled: !!session?.backendTokens?.accessToken,
    queryFn: async (): Promise<InvoiceTemplate[]> => {
      const res = await axios.get("/api/invoice-templates");
      return res.data.data;
    },
  });
}

/* -----------------------------
 * Get branding (company/store)
 * ------------------------------*/
export function useGetInvoiceBranding(
  storeId: string | null | undefined,
  session: Session | null,
  axios: AxiosInstance
) {
  return useQuery({
    queryKey: ["billing", "invoiceTemplates", "branding", storeId ?? "company"],
    enabled: !!session?.backendTokens?.accessToken,
    queryFn: async (): Promise<InvoiceBranding | null> => {
      const res = await axios.get("/api/invoice-templates/branding", {
        params: { storeId: storeId ?? null },
      });
      return res.data.data ?? null;
    },
  });
}

/* -----------------------------
 * Upsert branding
 * ------------------------------*/
export function useUpsertInvoiceBranding(
  storeId: string | null | undefined,
  session: Session | null,
  axios: AxiosInstance
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: InvoiceBrandingValues) => {
      const res = await axios.post("/api/invoice-templates/branding", {
        ...input,
        storeId: storeId ?? null,
      });
      return res.data.data as InvoiceBranding;
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["billing", "invoiceTemplates", "branding"],
      });
      qc.invalidateQueries({
        queryKey: ["billing", "invoiceTemplates", "previewHtml"],
      });
    },
  });
}

/* -----------------------------
 * Preview HTML (server-rendered)
 * ------------------------------*/
export function useInvoiceTemplatePreviewHtml(
  params: { storeId: string | null | undefined; templateId?: string | null },
  session: Session | null,
  axios: AxiosInstance
) {
  const { storeId, templateId } = params;

  return useQuery({
    queryKey: [
      "billing",
      "invoiceTemplates",
      "previewHtml",
      storeId ?? "company",
      templateId ?? "auto",
    ],
    enabled: !!session?.backendTokens?.accessToken,
    queryFn: async (): Promise<PreviewHtmlResponse> => {
      const res = await axios.get("/api/invoice-templates/preview/html", {
        params: {
          storeId: storeId ?? null,
          templateId: templateId ?? undefined,
        },
      });
      return res.data.data;
    },
  });
}

/* -----------------------------
 * PDF preview URL helper
 * ------------------------------*/
export function useInvoiceTemplatePreviewPdf(
  params: { storeId: string | null | undefined; templateId?: string | null },
  session: Session | null,
  axios: AxiosInstance
) {
  const { storeId, templateId } = params;

  return useMutation({
    mutationFn: async () => {
      const res = await axios.get("/api/invoice-templates/preview/pdf", {
        params: {
          storeId: storeId ?? null,
          templateId: templateId ?? undefined,
        },
      });
      return res.data.data as {
        pdfUrl: string;
        storageKey?: string;
        template: { id: string; key: string; version: string; name: string };
        storeId: string | null;
      };
    },
  });
}
