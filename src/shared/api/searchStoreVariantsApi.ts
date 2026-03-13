import { AxiosInstance } from "axios";

export type VariantSearchRow = {
  id: string;
  title: string;
  sku?: string | null;
  productName?: string | null;
  suggestedUnitPrice?: number | null;
  imageUrl?: string | null;
  available?: number;
  label?: string;
};

export async function searchStoreVariantsApi(
  axios: AxiosInstance,
  params: {
    storeId: string;
    search?: string;
    limit?: number;
    requireStock?: boolean;
  },
): Promise<VariantSearchRow[]> {
  const res = await axios.get("/api/catalog/products/variants/store", {
    params,
  });

  return (res.data.data ?? res.data) as VariantSearchRow[];
}
