/* eslint-disable @typescript-eslint/no-explicit-any */
export type Money = string;

export type CartRow = {
  id: string;
  cartId: number;
  status: string;
  ownerType: "customer" | "guest";
  customerId: string | null;
  guestToken: string | null;
  currency: string;

  subtotal: Money;
  shippingTotal: Money;
  total: Money;

  selectedShippingMethodLabel: string | null;

  lastActivityAt: string | null;
  expiresAt: string | null;
  createdAt: string | null;
};

export type CartItemRow = {
  id: string;
  cartId: string;
  productId: string;
  variantId: string | null;

  name: string;
  sku: string | null;
  variantTitle: string | null;

  quantity: number;
  unitPrice: Money;
  lineTotal: Money;

  weightKg?: string | number | null;
};

export type CartDetail = CartRow & {
  discountTotal?: Money;
  taxTotal?: Money;
  totalsBreakdown?: any;
  selectedShippingRateId?: string | null;
  items: CartItemRow[];
};

export type ListCartsQuery = {
  status?: string;
  search?: string;
  customerId?: string;
  limit?: number;
  offset?: number;
};

export type ListCartsResponse = {
  rows: CartRow[];
  count: number;
  limit: number;
  offset: number;
};
