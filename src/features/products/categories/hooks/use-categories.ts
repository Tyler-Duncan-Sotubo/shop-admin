/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session } from "next-auth";
import type { AxiosInstance } from "axios";
import type { Category, CreateCategoryPayload } from "../types/category.type";
import { useCreateMutation } from "@/shared/hooks/use-create-mutation";

export function useCategories(
  session: Session | null,
  axios: AxiosInstance,
  storeId: string | null
) {
  const qc = useQueryClient();
  const storeKey = storeId ?? "company-default";

  const canFetch = !!session?.backendTokens?.accessToken && !!storeId;

  // ✅ categories list
  const q = useQuery<any>({
    queryKey: ["categories", "admin", storeKey],
    enabled: canFetch,
    queryFn: async () => {
      const res = await axios.get("/api/catalog/categories/admin", {
        params: { storeId },
      });
      return res.data;
    },
    retry: (failureCount, err: any) => {
      const code = err?.response?.status;
      if (code === 401 || code === 403) return false;
      return failureCount < 2;
    },
  });

  // ✅ category + products (useQuery, enabled by BOTH session + storeId + categoryId)
  const useCategoryAdminWithProductsQuery = (params: {
    categoryId?: string;
    limit?: number;
    offset?: number;
    search?: string | null;
  }) =>
    useQuery<any>({
      queryKey: [
        "categories",
        "admin",
        "with-products",
        storeKey,
        params.categoryId,
        params.limit ?? 50,
        params.offset ?? 0,
        params.search ?? "",
      ],
      enabled: canFetch && !!params.categoryId,
      queryFn: async () => {
        const res = await axios.get(
          `/api/catalog/categories/${params.categoryId}/products/admin`,
          {
            params: {
              storeId,
              limit: params.limit ?? 50,
              offset: params.offset ?? 0,
              search: params.search ?? undefined,
            },
          }
        );
        return res.data;
      },
      retry: (failureCount, err: any) => {
        const code = err?.response?.status;
        if (code === 401 || code === 403) return false;
        return failureCount < 2;
      },
    });

  const createCategory = useCreateMutation<CreateCategoryPayload>({
    endpoint: "/api/catalog/categories",
    successMessage: "Category created successfully",
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: ["categories", "admin", storeKey],
      });
    },
  });

  const invalidate = async () => {
    await qc.invalidateQueries({ queryKey: ["categories", "admin", storeKey] });
  };

  return {
    storeId,
    storeKey,
    canFetch,

    categories: (q.data?.data ?? []) as Category[],
    isLoading: q.isLoading,
    isFetching: q.isFetching,
    isError: q.isError,
    fetchError:
      q.error instanceof Error
        ? q.error.message
        : q.error
        ? String(q.error)
        : null,

    createCategory,

    // ✅ use like: const productsQ = useCategoryAdminWithProductsQuery({ categoryId, ... })
    useCategoryAdminWithProductsQuery,

    invalidate,
  };
}
