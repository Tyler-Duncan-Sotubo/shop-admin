import { AxiosInstance } from "axios";

export type VariantSearchRow = {
  id: string;
  title: string;
  sku?: string | null;
  productName?: string | null;
  unitPrice?: number | null; // default price suggestion
  imageUrl?: string | null;
};

export async function searchStoreVariantsApi(
  axios: AxiosInstance,
  params: { storeId: string; search?: string; limit?: number }
): Promise<VariantSearchRow[]> {
  const res = await axios.get("/api/catalog/products/variants/store", {
    params,
  });
  console.log("searchStoreVariantsApi response:", res.data);
  return (res.data.data ?? res.data) as VariantSearchRow[];
}
