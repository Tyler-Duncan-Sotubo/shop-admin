import { useMemo } from "react";

export function useOrderPermissions(permissions: string[]) {
  return useMemo(() => {
    const permSet = new Set(permissions);
    const has = (key: string) => permSet.has(key);

    return {
      canRead: has("orders.read"),
      canCreate: has("orders.create"),
      canUpdate: has("orders.update"),
      canRefund: has("orders.refund"),
      canCancel: has("orders.cancel"),

      // Manual orders
      canCreateManual: has("orders.manual.create"),
      canEditManual: has("orders.manual.edit"),
      canDeleteManual: has("orders.manual.delete"),

      // Fulfillment
      canManageFulfillment: has("fulfillment.manage"),
      canManageReturns: has("fulfillment.manage_returns"),
    };
  }, [permissions]);
}
