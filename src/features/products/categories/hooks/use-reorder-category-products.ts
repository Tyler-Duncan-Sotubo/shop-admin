"use client";

import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import { reorderCategoryProductsApi } from "../api/categories.admin.api";

export function useReorderCategoryProducts() {
  const { data: session } = useSession();
  const axios = useAxiosAuth();
  const qc = useQueryClient();
  const { activeStoreId } = useStoreScope();

  const storeId = activeStoreId ?? null;
  const storeKey = storeId ?? "company-default";

  const canMutate =
    !!session?.backendTokens?.accessToken && !!storeId && !!axios;

  const mutation = useMutation({
    mutationFn: async (params: {
      categoryId: string;
      items: { productId: string; position: number; pinned?: boolean }[];
    }) => {
      if (!canMutate) {
        throw new Error("Not authenticated or store not selected");
      }
      return reorderCategoryProductsApi(axios, params);
    },
    onSuccess: async (_data, vars) => {
      // optional: refetch anything that depends on category products
      await qc.invalidateQueries({
        queryKey: ["category", "admin", "products", storeKey, vars.categoryId],
      });
      // if you use a different key for your products list, invalidate that instead
    },
  });

  return {
    ...mutation,
    canReorder: canMutate && !mutation.isPending,
    storeId,
    storeKey,
  };
}
