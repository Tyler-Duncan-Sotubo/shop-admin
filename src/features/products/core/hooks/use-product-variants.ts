"use client";

import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import {
  fetchVariants,
  ProductVariant,
  updateVariantApi,
} from "../api/product-variants.api";

export function useProductVariants(productId: string) {
  const { data: session } = useSession();
  const axios = useAxiosAuth();
  const qc = useQueryClient();

  const queryKey = ["product-variants, products", productId];

  const variantsQuery = useQuery<ProductVariant[]>({
    queryKey,
    enabled: !!session?.backendTokens?.accessToken && !!productId,
    queryFn: () => fetchVariants(axios, productId),
  });

  const updateVariant = useMutation({
    mutationFn: (args: {
      variantId: string;
      payload: Partial<ProductVariant>;
    }) => updateVariantApi(axios, args.variantId, args.payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey });
    },
  });

  return {
    variants: variantsQuery.data ?? [],
    isLoading: variantsQuery.isLoading,
    refetch: variantsQuery.refetch,
    updateVariant,
  };
}
