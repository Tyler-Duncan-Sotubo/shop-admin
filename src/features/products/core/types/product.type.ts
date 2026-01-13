/* eslint-disable @typescript-eslint/no-explicit-any */
export type ProductStatus = "draft" | "active" | "archived";
export type ProductType = "simple" | "variable";

export type ProductListRow = {
  id: string;
  name: string;
  createdAt: string | Date;
  status: ProductStatus;

  stock: number;
  minPrice: number | null;
  maxPrice: number | null;
  priceLabel: string | null;

  imageUrl: string | null;
  categories: { id: string; name: string }[];
  price_html: string;
  variantCount: number;
};

export type Product = {
  id: string;
  companyId: string;
  name: string;
  description: string | null;
  slug: string;
  status: ProductStatus;
  productType: ProductType;
  seoTitle: string | null;
  seoDescription: string | null;
  metadata: Record<string, any>;
  imageUrl: string | null;
};

export type CreateProductPayload = {
  storeId: string | null;
  name: string;
  description?: string | null;
  slug?: string;
  status?: ProductStatus;
  productType?: ProductType;

  seoTitle?: string | null;
  seoDescription?: string | null;

  categoryIds?: string[];
  links?: Partial<Record<"related" | "upsell" | "cross_sell", string[]>>;

  metadata?: Record<string, any>;
  base64Image?: string;
  imageAltText?: string;
};

export const STATUS_LABEL: Record<any, string> = {
  draft: "Draft",
  active: "Published",
  archived: "Archived",
};

export type FullProduct = {
  id: string;
  name: string;
  variations?: Array<{
    id: string;
    price: string;
    regular_price?: string;
    sale_price?: string;
    on_sale?: boolean;
    attributes?: Array<{ name: string; option: string }>;
    stock_status?: string;
    in_stock?: boolean;
    image?: { src: string };
    images?: Array<{ src: string }>;
  }>;
};
