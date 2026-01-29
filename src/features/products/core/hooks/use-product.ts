"use client";

import { useCreateMutation } from "@/shared/hooks/use-create-mutation";
import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import {
  CreateProductPayload,
  Product,
  ProductListRow,
} from "../types/product.type";

export type GetProductsParams = {
  search?: string;
  status?: string;
  limit?: number;
  offset?: number;
  storeId?: string | null;
};

export function useCreateProduct() {
  const createProduct = useCreateMutation<CreateProductPayload>({
    endpoint: `/api/catalog/products`,
    successMessage: "Product created successfully",
    refetchKey: "products",
  });

  return { createProduct };
}

export function useGetProducts(
  params: GetProductsParams = {},
  session?: { backendTokens?: { accessToken?: string } } | null,
) {
  const axios = useAxiosAuth();

  const normalizedParams: GetProductsParams = {
    search: params.search?.trim() || undefined,
    status: params.status || undefined,
    limit: params.limit ?? 500,
    offset: params.offset ?? 0,
    storeId: params.storeId || undefined,
  };

  const hasToken = Boolean(session?.backendTokens?.accessToken);

  return useQuery({
    queryKey: ["products", normalizedParams],
    enabled: hasToken,
    staleTime: 10_000,
    queryFn: async () => {
      const res = await axios.get("/api/catalog/products/admin", {
        params: normalizedParams,
      });

      const payload = res.data.data ?? res.data;

      return {
        rows: (payload.items ?? []) as ProductListRow[],
        total: Number(payload.total ?? 0),
        limit: Number(payload.limit ?? normalizedParams.limit),
        offset: Number(payload.offset ?? normalizedParams.offset),
      };
    },
  });
}

export function useGetProduct(
  productId: string,
  session: { backendTokens?: { accessToken?: string } } | null,
) {
  const axios = useAxiosAuth();
  const hasToken = Boolean(session?.backendTokens?.accessToken);
  return useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const res = await axios.get(`/api/catalog/products/${productId}/edit`);
      return (res.data.data ?? res.data) as Product;
    },

    enabled: !!productId && hasToken,
  });
}

export function useGetProductFull(
  productId: string | null,
  session?: { backendTokens?: { accessToken?: string } } | null,
) {
  const axios = useAxiosAuth();
  const hasToken = Boolean(session?.backendTokens?.accessToken);

  return useQuery({
    queryKey: ["product-full", productId],
    queryFn: async () => {
      const res = await axios.get(`/api/catalog/products/${productId}/full`);
      return res.data.data ?? res.data;
    },
    enabled: !!productId && hasToken,
    staleTime: 30_000,
  });
}
