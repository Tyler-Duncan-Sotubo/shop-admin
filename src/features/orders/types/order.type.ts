/* eslint-disable @typescript-eslint/no-explicit-any */

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "cancelled"
  | "fulfilled";

export type OrderChannel = "online" | "pos" | string;

export type OrderEvent = {
  id: string;
  type: string;
  fromStatus: string | null;
  toStatus: string | null;
  actorUserId: string | null;
  ipAddress: string | null;
  message: string | null;
  meta: any | null;
  createdAt: string;
};

export type Order = {
  id: string;
  orderNumber: string;

  status: OrderStatus;
  channel: OrderChannel;
  currency: string;

  deliveryMethodType?: "shipping" | "pickup" | null;
  shippingMethodLabel?: string | null;

  // money strings (per your backend)
  subtotal?: string;
  discountTotal?: string;
  taxTotal?: string;
  shippingTotal?: string;
  total?: string;

  shippingAddress?: any | null;
  billingAddress?: any | null;

  createdAt?: string;
  updatedAt?: string;
};

export type ListOrdersParams = {
  limit?: number;
  offset?: number;
  search?: string;
  status?: OrderStatus;
  channel?: OrderChannel;
};

export type OrderItem = {
  id: string;
  orderId: string;
  productId?: string | null;
  variantId?: string | null;
  sku?: string | null;
  name: string;
  quantity: number;
  unitPrice: any;
  lineTotal: any;
  metadata?: any;
};

export type OrderWithItems = Order & {
  items: OrderItem[];
  events?: OrderEvent[];
};
