import { AxiosInstance } from "axios";
import { CreateProductPayload, Product } from "../types/product.type";

export async function createProductApi(
  axiosInstance: AxiosInstance,
  data: CreateProductPayload,
  accessToken?: string
): Promise<Product> {
  const res = await axiosInstance.post(`/api/catalog/products`, data, {
    headers: {
      Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
    },
  });
  return (res.data.data ?? res.data) as Product;
}

/**
 * Get all products (supports pagination/search if backend supports it)
 */
export async function getProductsApi(
  axiosInstance: AxiosInstance,
  params?: {
    search?: string;
    status?: string;
    limit?: number;
    offset?: number;
  },
  accessToken?: string
): Promise<Product[]> {
  const res = await axiosInstance.get(`/api/catalog/products`, {
    params,
    headers: {
      Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
    },
  });

  return (res.data.data ?? res.data) as Product[];
}
