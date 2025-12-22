/* eslint-disable @typescript-eslint/no-explicit-any */
import { ManualOrderFormValues } from "../schema/manual-orders.schema";

export type ManualOrder = {
  id: string;
  companyId: string;
  orderNumber: string;
  status: "draft" | "pending_payment" | string;
  channel: "manual" | "pos" | string;
  currency: string;
  storeId?: string | null;
  customerId?: string | null;
  originInventoryLocationId: string;
  shippingAddress?: Record<string, any> | null;
  billingAddress?: Record<string, any> | null;
  subtotal: string;
  discountTotal: string;
  taxTotal: string;
  shippingTotal: string;
  total: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateManualOrderPayload = {
  storeId?: string | null;
  customerId?: string | null;
  currency: string;
  channel?: "manual" | "pos";
  originInventoryLocationId: string;
  shippingAddress?: Record<string, any> | null;
  billingAddress?: Record<string, any> | null;
};

export type ManualOrderFormModalProps = {
  open: boolean;
  mode: "create"; // keep same pattern; you can add edit later
  order?: ManualOrder | null;
  onClose: () => void;
  onSubmit: (values: ManualOrderFormValues) => Promise<void>;
};
