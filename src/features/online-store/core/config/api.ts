import type { AxiosInstance } from "axios";
import { storefrontConfigRoutes } from "./routes";
import type {
  StorefrontConfigV1,
  StorefrontOverrideRow,
  StorefrontOverridesV1,
} from "../types/storefront.type";

// ✅ NEW type
export type StoreThemeStatus = {
  hasPublishedTheme: boolean;
  themeId: string | null;
  isDefaultTheme: boolean;
};

export async function fetchResolvedConfig(
  axios: AxiosInstance,
  storeId?: string
): Promise<StorefrontConfigV1> {
  const url = storefrontConfigRoutes.resolvedConfig(storeId);
  const res = await axios.get(url);
  return (res.data?.data ?? res.data) as StorefrontConfigV1;
}

export async function fetchPublishedOverride(
  axios: AxiosInstance,
  storeId: string
): Promise<StorefrontOverrideRow | null> {
  const res = await axios.get(
    storefrontConfigRoutes.publishedOverride(storeId)
  );
  return (res.data?.data ?? res.data ?? null) as StorefrontOverrideRow | null;
}

export async function upsertDraftOverrideApi(
  axios: AxiosInstance,
  storeId: string,
  payload: Partial<StorefrontOverridesV1> & {
    baseId?: string;
    themeId?: string | null;
  },
  accessToken?: string
): Promise<StorefrontOverrideRow> {
  const res = await axios.patch(
    storefrontConfigRoutes.upsertOverride(storeId),
    { status: "draft", ...payload },
    {
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
      },
    }
  );
  return (res.data?.data ?? res.data) as StorefrontOverrideRow;
}

export async function publishDraftApi(
  axios: AxiosInstance,
  storeId: string,
  accessToken?: string
): Promise<{ ok: true }> {
  const res = await axios.post(
    storefrontConfigRoutes.publishDraft(storeId),
    {},
    {
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
      },
    }
  );
  return (res.data?.data ?? res.data) as { ok: true };
}

// ✅ NEW fetcher
export async function fetchThemeStatus(
  axios: AxiosInstance,
  storeId: string
): Promise<StoreThemeStatus> {
  const res = await axios.get(storefrontConfigRoutes.themeStatus(storeId));
  return (res.data?.data ?? res.data) as StoreThemeStatus;
}
