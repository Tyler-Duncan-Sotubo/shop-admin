export type OrderTab =
  | "all"
  | "on_hold"
  | "paid"
  | "fulfilled"
  | "cancelled"
  | "draft";

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "fulfilled"
  | "cancelled"
  | "draft";

export const ORDER_TAB_TO_STATUS: Record<OrderTab, OrderStatus | undefined> = {
  all: undefined,
  on_hold: "pending_payment",
  paid: "paid",
  fulfilled: "fulfilled",
  cancelled: "cancelled",
  draft: "draft",
};
