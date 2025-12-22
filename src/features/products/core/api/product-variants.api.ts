import { AxiosInstance } from "axios";

export type ProductVariant = {
  id: string;
  companyId: string;
  productId: string;

  title: string | null;
  sku: string | null;
  barcode: string | null;

  option1: string | null;
  option2: string | null;
  option3: string | null;

  isActive: boolean;

  regularPrice: string;
  salePrice: string | null;
  currency: string;

  weight: string | null;
  length: string | null;
  width: string | null;
  height: string | null;

  stockQuantity: string | null;
  lowStockThreshold: string | null;

  base64Image: string | null;
};

export async function fetchVariants(
  axios: AxiosInstance,
  productId: string
): Promise<ProductVariant[]> {
  const res = await axios.get(`/api/catalog/products/${productId}/variants`);
  return res.data.data as ProductVariant[];
}

export async function updateVariantApi(
  axios: AxiosInstance,
  variantId: string,
  payload: Partial<ProductVariant>
) {
  const res = await axios.patch(`/api/catalog/variants/${variantId}`, payload);
  return res.data.data as ProductVariant;
}
