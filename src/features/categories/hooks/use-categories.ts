"use client";

import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { useCreateMutation } from "@/shared/hooks/use-create-mutation";
import { fetchCategories } from "../api/categories.api";
import type { Category, CreateCategoryPayload } from "../types/category.type";
import { useStoreScope } from "@/lib/providers/store-scope-provider";

export function useCategories() {
  const { data: session, status } = useSession();
  const axios = useAxiosAuth();
  const qc = useQueryClient();
  const { activeStoreId } = useStoreScope();

  const storeKey = activeStoreId ?? "company-default";

  const q = useQuery<Category[]>({
    queryKey: ["categories", storeKey],
    enabled: !!session?.backendTokens?.accessToken,
    queryFn: () => fetchCategories(axios, { storeId: activeStoreId ?? null }),
  });

  const createCategory = useCreateMutation<
    CreateCategoryPayload & { storeId?: string | null }
  >({
    endpoint: "/api/catalog/categories",
    successMessage: "Category created successfully",

    // ✅ force correct invalidation
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["categories", storeKey] });
    },
  });

  return {
    sessionStatus: status,
    categories: q.data ?? [],
    isLoading: q.isLoading,
    isError: q.isError,
    fetchError:
      q.error instanceof Error
        ? q.error.message
        : q.error
        ? String(q.error)
        : null,
    createCategory,
    invalidate: async () => {
      await qc.invalidateQueries({ queryKey: ["categories", storeKey] });
    },
  };
}
