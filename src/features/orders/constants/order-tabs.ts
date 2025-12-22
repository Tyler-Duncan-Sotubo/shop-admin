export type OrderTab = "all" | "on_hold" | "paid" | "fulfilled" | "cancelled";

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "fulfilled"
  | "cancelled";

export const ORDER_TAB_TO_STATUS: Record<OrderTab, OrderStatus | undefined> = {
  all: undefined,
  on_hold: "pending_payment",
  paid: "paid",
  fulfilled: "fulfilled",
  cancelled: "cancelled",
};
