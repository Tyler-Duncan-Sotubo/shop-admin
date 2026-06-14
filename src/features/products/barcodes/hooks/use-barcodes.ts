"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { useSession } from "next-auth/react";
import {
  BarcodeFormat,
  GenerateBarcodeResult,
} from "../../core/types/barcode.type";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type BulkGenerateResult = {
  total: number;
  skipped: number; // ← remove the ?
  succeeded: number;
  failed: number;
  results: GenerateBarcodeResult[];
  errors: { variantId: string; error: string }[];
};

export type LabelsPdfResult = {
  pdfUrl: string;
  storageKey: string;
  count: number;
};

export type BarcodeLookupResult = {
  id: string;
  title: string | null;
  sku: string | null;
  barcode: string | null;
  productName: string | null;
  regularPrice: string | null;
  salePrice: string | null;
  currency: string | null;
  isActive: boolean;
};

// ─────────────────────────────────────────────
// 1. Generate barcode for a single variant
// POST /api/catalog/barcodes/variants/:variantId/generate
// ─────────────────────────────────────────────

export function useGenerateBarcodeForVariant() {
  const axios = useAxiosAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      variantId,
      format = "code128",
    }: {
      variantId: string;
      format?: BarcodeFormat;
    }): Promise<GenerateBarcodeResult> => {
      const res = await axios.post(
        `/api/catalog/barcodes/variants/${variantId}/generate`,
        { format },
      );
      return res.data.data ?? res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["product-variants"] });
      qc.invalidateQueries({ queryKey: ["product-options"] });
    },
  });
}

// ─────────────────────────────────────────────
// 2. Bulk generate for all variants of a product
// POST /api/catalog/barcodes/products/:productId/generate-all
// ─────────────────────────────────────────────

export function useBulkGenerateForProduct() {
  const axios = useAxiosAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      format = "code128",
    }: {
      productId: string;
      format?: BarcodeFormat;
    }): Promise<BulkGenerateResult> => {
      const res = await axios.post(
        `/api/catalog/barcodes/products/${productId}/generate-all`,
        { format },
      );
      return res.data.data ?? res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["product-variants"] });
    },
  });
}

// ─────────────────────────────────────────────
// 3. Bulk generate for all active variants in a store
// POST /api/catalog/barcodes/stores/:storeId/generate-all
// ─────────────────────────────────────────────

export function useBulkGenerateForStore() {
  const axios = useAxiosAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      storeId,
      format = "code128",
      skipExisting = true,
    }: {
      storeId: string;
      format?: BarcodeFormat;
      skipExisting?: boolean;
    }): Promise<BulkGenerateResult> => {
      const res = await axios.post(
        `/api/catalog/barcodes/stores/${storeId}/generate-all`,
        { format, skipExisting },
      );
      return res.data.data ?? res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["product-variants"] });
    },
  });
}

// ─────────────────────────────────────────────
// 4. Generate PDF label sheet
// POST /api/catalog/barcodes/labels/pdf
// ─────────────────────────────────────────────

export function useGenerateLabelsPdf() {
  const axios = useAxiosAuth();

  return useMutation({
    mutationFn: async ({
      variantIds,
      format = "code128",
    }: {
      variantIds: string[];
      format?: BarcodeFormat;
    }): Promise<LabelsPdfResult> => {
      const res = await axios.post(`/api/catalog/barcodes/labels/pdf`, {
        variantIds,
        format,
      });
      return res.data.data ?? res.data;
    },
  });
}

// ─────────────────────────────────────────────
// 5. Lookup variant by barcode or SKU
// GET /api/catalog/barcodes/lookup?value=xxx&storeId=xxx
// ─────────────────────────────────────────────

export function useBarcodeLookup({
  value,
  storeId,
  enabled = false,
}: {
  value: string;
  storeId: string;
  enabled?: boolean;
}) {
  const axios = useAxiosAuth();
  const { data: session } = useSession();
  const hasToken = Boolean(session?.backendTokens?.accessToken);

  return useQuery({
    queryKey: ["barcode-lookup", value, storeId],
    enabled: enabled && hasToken && !!value.trim() && !!storeId,
    staleTime: 0,
    retry: false,
    queryFn: async (): Promise<BarcodeLookupResult> => {
      const res = await axios.get(`/api/catalog/barcodes/lookup`, {
        params: { value: value.trim(), storeId },
      });
      return res.data.data ?? res.data;
    },
  });
}
