"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session } from "next-auth";
import type { AxiosInstance, AxiosError } from "axios";
import type {
  StorefrontOverrideRow,
  StorefrontOverridesV1,
} from "../types/storefront.type";
import {
  fetchPublishedOverride,
  fetchThemeStatus, // ✅ NEW
  publishDraftApi,
  upsertDraftOverrideApi,
  type StoreThemeStatus, // ✅ NEW
} from "../config/api";
import { storefrontKeys } from "../config/keys";

type ApiError = {
  status?: "error";
  error?: { message?: string };
  message?: string;
};

export function usePublishedStorefrontOverride(
  session: Session | null,
  axios: AxiosInstance,
  storeId?: string
) {
  const enabled = !!session?.backendTokens?.accessToken && !!storeId;

  return useQuery({
    queryKey: storeId
      ? storefrontKeys.publishedOverride(storeId)
      : ["storefront-config", "override", "published", "none"],
    enabled,
    queryFn: async (): Promise<StorefrontOverrideRow | null> => {
      try {
        return await fetchPublishedOverride(axios, storeId!);
      } catch (err) {
        const e = err as AxiosError<ApiError>;
        const msg =
          e.response?.data?.error?.message ??
          e.response?.data?.message ??
          e.message;
        throw new Error(msg);
      }
    },
  });
}

// ✅ NEW hook
export function useStoreThemeStatus(
  session: Session | null,
  axios: AxiosInstance,
  storeId?: string
) {
  const enabled = !!session?.backendTokens?.accessToken && !!storeId;

  return useQuery({
    queryKey: storeId
      ? storefrontKeys.themeStatus(storeId)
      : ["storefront-config", "theme-status", "none"],
    enabled,
    queryFn: async (): Promise<StoreThemeStatus> => {
      try {
        return await fetchThemeStatus(axios, storeId!);
      } catch (err) {
        const e = err as AxiosError<ApiError>;
        const msg =
          e.response?.data?.error?.message ??
          e.response?.data?.message ??
          e.message;
        throw new Error(msg);
      }
    },
  });
}

export function useUpsertDraftOverride(
  session: Session | null,
  axios: AxiosInstance,
  storeId: string
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: Partial<StorefrontOverridesV1> & {
        baseId?: string;
        themeId?: string | null;
      }
    ) => {
      const token = session?.backendTokens?.accessToken;
      if (!token) throw new Error("Missing access token");
      try {
        return await upsertDraftOverrideApi(axios, storeId, payload, token);
      } catch (err) {
        const e = err as AxiosError<ApiError>;
        const msg =
          e.response?.data?.error?.message ??
          e.response?.data?.message ??
          e.message;
        throw new Error(msg);
      }
    },
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: storefrontKeys.publishedOverride(storeId),
      });
      await qc.invalidateQueries({
        queryKey: storefrontKeys.resolved(storeId),
      });
      // ✅ NEW: update status too (optional but recommended)
      await qc.invalidateQueries({
        queryKey: storefrontKeys.themeStatus(storeId),
      });
    },
  });
}

export function usePublishDraftOverride(
  session: Session | null,
  axios: AxiosInstance,
  storeId: string
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = session?.backendTokens?.accessToken;
      if (!token) throw new Error("Missing access token");
      try {
        return await publishDraftApi(axios, storeId, token);
      } catch (err) {
        const e = err as AxiosError<ApiError>;
        const msg =
          e.response?.data?.error?.message ??
          e.response?.data?.message ??
          e.message;
        throw new Error(msg);
      }
    },
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: storefrontKeys.publishedOverride(storeId),
      });
      await qc.invalidateQueries({
        queryKey: storefrontKeys.resolved(storeId),
      });
      // ✅ NEW: status should refresh after publish
      await qc.invalidateQueries({
        queryKey: storefrontKeys.themeStatus(storeId),
      });
    },
  });
}
