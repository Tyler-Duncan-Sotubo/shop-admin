// src/features/analytics/extended/types/extended-analytics.type.ts

export type CompareMode = "wow" | "mom" | "yoy" | "custom";

export type Delta = {
  current: number;
  previous: number;
  change: number;
  changePct: number | null;
};

export type ExtendedSalesCards = {
  aov: Delta;
  netSalesMinor: Delta;
  grossSalesMinor: Delta;
  discountTotalMinor: Delta;
  refundedOrdersCount: Delta;
  refundRate: Delta;
};

export type AbcTier = "A" | "B" | "C";

export type ProductAbcRow = {
  productId: string;
  variantId: string | null;
  productName: string | null;
  variantTitle: string | null;
  revenueMinor: number;
  quantity: number;
  revenueShare: number;
  cumulativeShare: number;
  tier: AbcTier;
};

export type SellThroughRow = {
  productId: string | null;
  variantId: string;
  productName: string | null;
  variantTitle: string | null;
  sku: string | null;
  unitsSold: number;
  unitsAvailable: number;
  sellThroughRate: number;
};

export type NewVsReturningRow = {
  period: string;
  newCustomers: number;
  returningCustomers: number;
  newRevenue: number;
  returningRevenue: number;
};

export type FulfillmentStats = {
  avgFulfillmentHours: Delta;
  onTimeRate: Delta;
  totalFulfilled: Delta;
};

export type ExtendedAnalyticsParams = {
  from: string;
  to: string;
  storeId?: string | null;
  compareMode?: CompareMode;
  compareFrom?: string;
  compareTo?: string;
};
