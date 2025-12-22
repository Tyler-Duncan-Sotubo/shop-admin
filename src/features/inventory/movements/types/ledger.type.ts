/* eslint-disable @typescript-eslint/no-explicit-any */
export type InventoryLedgerRow = {
  id: string;
  companyId: string;

  locationId: string;
  locationName: string | null;

  productVariantId: string;
  variantName: string | null;
  sku: string | null;

  deltaAvailable: number;
  deltaReserved: number;

  type: string;

  refType: string | null;
  refId: string | null;

  note: string | null;
  meta: any | null;

  createdAt: string;
};

export type ListLedgerParams = {
  limit?: number;
  offset?: number;

  tab?: "all" | "deductions" | "reservations" | "releases";

  locationId?: string;
  orderId?: string;
  q?: string;
};

export type LedgerListResponse = {
  rows: InventoryLedgerRow[];
  count: number;
  limit: number;
  offset: number;
};
