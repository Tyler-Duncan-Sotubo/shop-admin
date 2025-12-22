import { AxiosInstance } from "axios";
import {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "../types/category.type";

export async function fetchCategories(
  axios: AxiosInstance,
  params?: { storeId?: string | null }
): Promise<Category[]> {
  const res = await axios.get("/api/catalog/categories", {
    params: { storeId: params?.storeId ?? null },
  }); // TODO change
  return (res.data?.data ?? res.data ?? []) as Category[];
}

export async function createCategoryApi(
  axios: AxiosInstance,
  data: CreateCategoryPayload,
  accessToken?: string
): Promise<Category> {
  const res = await axios.post("/api/catalog/categories", data, {
    headers: {
      Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
    },
  });
  return (res.data?.data ?? res.data) as Category;
}

export async function updateCategoryApi(
  axios: AxiosInstance,
  categoryId: string,
  data: UpdateCategoryPayload,
  accessToken?: string
): Promise<Category> {
  const res = await axios.patch(`/api/catalog/categories/${categoryId}`, data, {
    headers: {
      Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
    },
  });
  return (res.data?.data ?? res.data) as Category;
}

export async function deleteCategoryApi(
  axios: AxiosInstance,
  categoryId: string,
  accessToken?: string
): Promise<{ success: true }> {
  const res = await axios.delete(`/api/catalog/categories/${categoryId}`, {
    headers: {
      Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
    },
  });
  return (res.data?.data ?? res.data) as { success: true };
}
