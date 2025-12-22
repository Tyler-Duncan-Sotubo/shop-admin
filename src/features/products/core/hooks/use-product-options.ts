"use client";

import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import {
  createOptionApi,
  createOptionValueApi,
  fetchProductOptions,
  generateVariantsApi,
  ProductOption,
} from "../api/product-options.api";

export function useProductOptions(productId: string) {
  const { data: session } = useSession();
  const axios = useAxiosAuth();
  const qc = useQueryClient();

  const queryKey = ["product-options", "product-variants, products", productId];

  const optionsQuery = useQuery<ProductOption[]>({
    queryKey,
    enabled: !!session?.backendTokens?.accessToken && !!productId,
    queryFn: () => fetchProductOptions(axios, productId),
  });

  const createOption = useMutation({
    mutationFn: (payload: { name: string; position?: number }) =>
      createOptionApi(axios, productId, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey });
    },
  });

  const createOptionValue = useMutation({
    mutationFn: (args: {
      optionId: string;
      value: string;
      position?: number;
    }) =>
      createOptionValueApi(axios, args.optionId, {
        value: args.value,
        position: args.position,
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey });
    },
  });

  const generateVariants = useMutation({
    mutationFn: () => generateVariantsApi(axios, productId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["product-variants", productId] });
    },
  });

  return {
    options: optionsQuery.data ?? [],
    isLoading: optionsQuery.isLoading,
    refetch: optionsQuery.refetch,

    createOption,
    createOptionValue,
    generateVariants,
  };
}
