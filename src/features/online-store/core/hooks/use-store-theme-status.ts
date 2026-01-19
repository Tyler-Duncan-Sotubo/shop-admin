"use client";

import { useMemo } from "react";
import type { Session } from "next-auth";
import type { AxiosInstance } from "axios";
import { usePublishedStorefrontOverride } from "./use-storefront-overrides";

const DEFAULT_THEME_ID = "019bacc9-5933-7f51-bb6c-df5ab583c255";

export function useStoreThemeStatusWithId(
  session: Session | null,
  axios: AxiosInstance,
  storeId: string
) {
  const publishedQ = usePublishedStorefrontOverride(session, axios, storeId);

  const status = useMemo(() => {
    const row = publishedQ.data;
    if (!row) {
      return {
        hasPublishedTheme: false,
        themeId: null,
      };
    }

    const themeId = row.themeId ?? null;

    return {
      hasPublishedTheme: !!themeId,
      themeId,
      isDefaultTheme: themeId === DEFAULT_THEME_ID,
    };
  }, [publishedQ.data]);

  return {
    ...publishedQ,
    data: status,
  };
}
