export type DashboardRangeParams = {
  from: string; // ISO
  to: string; // ISO
  storeId?: string | null;
};

export type Delta = {
  current: number;
  previous: number;
  change: number;
  changePct: number | null; // e.g. 0.12 = +12%
};

export type CommerceCards = {
  totalSalesMinor: number;
  totalOrders: number;
  newCustomers: number;
  webVisits: number;

  deltas: {
    totalSalesMinor: Delta;
    totalOrders: Delta;
    newCustomers: Delta;
    webVisits: Delta;
  };

  previousRange: { from: string; to: string };
};

export type SalesTimeseriesPoint = {
  t: string; // date_trunc output
  salesMinor: number;
  orders: number;
};

export type TopProductRow = {
  productId: string | null;
  variantId: string | null;
  name: string; // snapshot
  productName: string | null;
  variantTitle: string | null;
  quantity: number;
  revenueMinor: number;
  imageUrl?: string | null;
  currency?: string;
  categories?: string[];
  price?: string | null | undefined;
};

// src/features/analytics/commerce/types/top-product-row.type.ts

export type CommerceTopProductRow = {
  productId: string | null;
  variantId: string | null;
  imageUrl: string | null;
  currency: string;
  // coming from backend now:
  productName: string | null; // may exist via join
  variantTitle: string | null; // may exist via join
  quantity: number;
  revenueMinor: number;

  // placeholders (backend later):
  price?: string | null; // e.g. "12999.00" or "12999" (whatever your formatter expects)
  categories?: string[] | null; // later when you have product categories
};

type RecentOrderItemPreview = {
  imageUrl: string | null;
  productName: string | null;
  category: string | null; // first category only
  price: string | null; // variant/default variant price (numeric->string)
  currency: string | null;
};

export type RecentOrderRow = {
  id: string;
  orderNumber: string;
  status: string;
  channel: string | null;
  currency: string | null;
  totalMinor: number;
  createdAt: string;
  paidAt: string | null;
  itemsPreview: RecentOrderItemPreview[]; // usually render first 1–3
};

export type OrdersByChannelPoint = {
  channel: string; // "online" | "manual" | "pos" | "unknown"
  label: string; // "Online", "Manual", "POS"
  value: number; // used directly by pie chart
  ordersCount: number;
  revenueMinor: number;
};

/** ✅ NEW: types (if you haven't added them to your types file yet) */
export type CommerceGrossSalesCards = {
  grossSalesMinor: number;
  fulfilledOrders: number;
  onHoldOrders: number;
  totalOrders: number;
  deltas: {
    grossSalesMinor: {
      current: number;
      previous: number;
      change: number;
      changePct: number | null;
    };
    fulfilledOrders: {
      current: number;
      previous: number;
      change: number;
      changePct: number | null;
    };
    onHoldOrders: {
      current: number;
      previous: number;
      change: number;
      changePct: number | null;
    };
    totalOrders: {
      current: number;
      previous: number;
      change: number;
      changePct: number | null;
    };
  };
  previousRange: { from: string; to: string };
};

export type LatestPaymentRow = {
  id: string;
  createdAt: string;
  status: string;
  method: string;
  provider: string | null;
  currency: string;
  amountMinor: number;

  reference: string | null;
  providerRef: string | null;

  receivedAt: string | null;
  confirmedAt: string | null;

  invoiceId: string | null;
  invoiceNumber: string | null;

  taxMinor: number;
  invoiceTotalMinor: number | null;
};
