"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import {
  searchStoreVariantsApi,
  VariantSearchRow,
} from "../api/searchStoreVariantsApi";

export function useVariantSearch(
  storeId?: string | null,
  requireStock?: boolean,
) {
  const axios = useAxiosAuth();
  const [search, setSearch] = useState("");

  const query = useQuery<VariantSearchRow[]>({
    queryKey: ["variants", "store", storeId, "search", search, requireStock],
    enabled: !!storeId,
    queryFn: () =>
      searchStoreVariantsApi(axios, {
        storeId: storeId!,
        search,
        limit: 50,
        requireStock,
      }),
  });

  const options = useMemo(
    () =>
      (query.data ?? []).map((v) => ({
        id: v.id,
        title: v.title,
        sku: v.sku ?? null,
        productName: v.productName ?? null,
        suggestedUnitPrice: v.suggestedUnitPrice ?? null,
        imageUrl: v.imageUrl ?? null,
        available: v.available ?? 0,
        label: `${v.productName ?? "Product"} • ${v.title}${
          v.sku ? ` • ${v.sku}` : ""
        }${!requireStock ? ` • ${v.available ?? 0} in stock` : ""}`,
      })),
    [query.data, requireStock],
  );

  return { ...query, search, setSearch, options };
}
