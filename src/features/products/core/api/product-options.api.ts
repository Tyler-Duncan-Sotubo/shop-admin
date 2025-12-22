import { AxiosInstance } from "axios";

export type ProductOptionValue = {
  id: string;
  value: string;
  position: number;
};

export type ProductOption = {
  id: string;
  productId: string;
  companyId: string;
  name: string;
  position: number;
  values: ProductOptionValue[];
};

export async function fetchProductOptions(
  axios: AxiosInstance,
  productId: string
): Promise<ProductOption[]> {
  const res = await axios.get(`/api/catalog/products/${productId}/options`);
  return res.data.data as ProductOption[];
}

export async function createOptionApi(
  axios: AxiosInstance,
  productId: string,
  payload: { name: string; position?: number }
) {
  const res = await axios.post(
    `/api/catalog/products/${productId}/options`,
    payload
  );
  return res.data.data;
}

export async function createOptionValueApi(
  axios: AxiosInstance,
  optionId: string,
  payload: { value: string; position?: number }
) {
  const res = await axios.post(
    `/api/catalog/options/${optionId}/values`,
    payload
  );
  return res.data.data;
}

export async function generateVariantsApi(
  axios: AxiosInstance,
  productId: string
) {
  const res = await axios.post(
    `/api/catalog/products/${productId}/variants/generate`
  );
  return res.data.data; // inserted variants array
}
