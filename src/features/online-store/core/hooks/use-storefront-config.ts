"use client";

import { useQuery } from "@tanstack/react-query";
import type { Session } from "next-auth";
import type { AxiosInstance, AxiosError } from "axios";
import type { StorefrontConfigV1 } from "../types/storefront.type";
import { fetchResolvedConfig } from "../config/api";
import { storefrontKeys } from "../config/keys";

type ApiError = {
  status?: "error";
  error?: { message?: string };
  message?: string;
};

export function useStorefrontResolvedConfig(
  session: Session | null,
  axios: AxiosInstance,
  storeId?: string
) {
  const enabled = !!session?.backendTokens?.accessToken && !!storeId;

  return useQuery({
    queryKey: storefrontKeys.resolved(storeId),
    enabled,
    queryFn: async (): Promise<StorefrontConfigV1> => {
      try {
        return await fetchResolvedConfig(axios, storeId);
      } catch (err) {
        const e = err as AxiosError<ApiError>;
        const msg =
          e.response?.data?.error?.message ??
          e.response?.data?.message ??
          e.message;
        throw new Error(msg);
      }
    },
    placeholderData: (prev) => prev,
  });
}
