import type { AxiosInstance } from "axios";

const authHeader = (accessToken?: string) => ({
  Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
});

export async function fetchCategoriesAdmin(
  axios: AxiosInstance,
  params: { storeId: string },
  accessToken?: string
) {
  const { data } = await axios.get("/api/catalog/categories/admin", {
    params,
    headers: authHeader(accessToken),
  });
  return data;
}

export async function fetchCategoryAdmin(
  axios: AxiosInstance,
  params: { storeId: string; categoryId: string },
  accessToken?: string
) {
  const { data } = await axios.get(
    `/api/catalog/categories/${params.categoryId}/admin`,
    {
      params: { storeId: params.storeId },
      headers: authHeader(accessToken),
    }
  );
  return data;
}

export async function fetchCategoryProductsAdmin(
  axios: AxiosInstance,
  params: {
    storeId: string;
    categoryId: string;
    limit?: number;
    offset?: number;
    search?: string;
  },
  accessToken?: string
) {
  const { storeId, categoryId, ...rest } = params;
  const { data } = await axios.get(
    `/api/catalog/categories/${categoryId}/products/admin`,
    {
      params: { storeId, ...rest },
      headers: authHeader(accessToken),
    }
  );
  return data;
}

export async function fetchCategoryAdminWithProducts(
  axios: AxiosInstance,
  params: {
    storeId: string;
    categoryId: string;
    limit?: number;
    offset?: number;
    search?: string | null;
  },
  accessToken?: string
) {
  const res = await axios.get(
    `/api/catalog/categories/${params.categoryId}/products/admin`,
    {
      params: {
        storeId: params.storeId,
        limit: params.limit ?? 50,
        offset: params.offset ?? 0,
        search: params.search ?? undefined,
      },
      headers: authHeader(accessToken),
    }
  );

  return res.data;
}

export async function reorderCategoryProductsApi(
  axios: AxiosInstance,
  params: {
    categoryId: string;
    items: { productId: string; position: number; pinned?: boolean }[];
  },
  accessToken?: string
) {
  const res = await axios.patch(
    `/api/catalog/categories/${params.categoryId}/products/reorder`,
    { items: params.items },
    { headers: authHeader(accessToken) }
  );
  return res.data;
}
