export type TransferStatus = "pending" | "completed" | "cancelled";

export type TransferItemRow = {
  id: string;
  productVariantId: string;
  quantity: number;
  // if your API does NOT include productName/sku yet, we'll map from inventory rows later (optional)
  productName?: string;
  variantTitle?: string | null;
  sku?: string | null;
};

export type TransferRow = {
  id: string;
  companyId: string;
  fromLocationId: string;
  toLocationId: string;
  reference?: string | null;
  notes?: string | null;
  status: TransferStatus;
  createdAt?: string; // depends on schema
  items: TransferItemRow[];
};

export type TransferListItem = {
  id: string;
  companyId: string;
  fromLocationId: string;
  toLocationId: string;

  fromLocationName: string | null;
  toLocationName: string | null;

  reference: string | null;
  status: "pending" | "completed" | "cancelled" | "in_transit";
  notes: string | null;

  createdAt: string;
  updatedAt: string;
  completedAt: string | null;

  itemsCount: number;
  totalQuantity: number;

  items: {
    id: string;
    productVariantId: string;
    quantity: number;
    productName: string | null;
    variantTitle: string | null;
    sku: string | null;
  }[];
};
