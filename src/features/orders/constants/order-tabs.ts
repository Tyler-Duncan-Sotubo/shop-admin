export type OrderTab =
  | "all"
  | "draft"
  | "on_hold"
  | "paid"
  | "lay_buy" // 👈
  | "fulfilled"
  | "cancelled";

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "fulfilled"
  | "cancelled"
  | "draft"
  | "lay_buy";

export const ORDER_TAB_TO_STATUS: Record<OrderTab, OrderStatus | undefined> = {
  all: undefined,
  on_hold: "pending_payment",
  paid: "paid",
  fulfilled: "fulfilled",
  cancelled: "cancelled",
  draft: "draft",
  lay_buy: "lay_buy",
};
