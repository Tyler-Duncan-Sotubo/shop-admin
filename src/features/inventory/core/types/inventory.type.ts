export type InventoryOverviewQuery = {
  locationId?: string;
  search?: string;
  status?: "active" | "draft" | "archived";
  limit?: number;
  offset?: number;
  storeId: string;
};

export type InventoryOverviewRow = {
  locationId: string;
  locationName: string;
  locationType: string;

  productId: string;
  productName: string;
  productStatus: "active" | "draft" | "archived";

  variantId: string;
  variantTitle: string | null;
  sku: string | null;
  isVariantActive: boolean;

  inStock: number;
  committed: number;
  safetyStock: number;
  onHand: number;
  lowStock: boolean;

  updatedAt: string | null;
};

export type StoreLocationRow = {
  locationId: string;
  name: string;
  type: string; // warehouse | store
  isPrimary: boolean;
  isActive: boolean; // effective active
};

export type InventoryGroupRow = {
  productName: string;
  inStock: number;
  committed: number;
  onHand: number;
  lowStock: boolean;
  children: InventoryOverviewRow[];
};
