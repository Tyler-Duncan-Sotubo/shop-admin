/* eslint-disable @typescript-eslint/no-explicit-any */
export type PaymentMethod =
  | "gateway"
  | "bank_transfer"
  | "cash"
  | "pos"
  | "manual";
export type GatewayProvider = "paystack" | "stripe"; // extend later

export type StorePaymentMethodStatus =
  | "disconnected"
  | "pending"
  | "connected"
  | "error"
  | "configured"
  | "unconfigured";

export type BankDetails = {
  accountName: string;
  accountNumber: string;
  bankName: string;
  instructions?: string | null;
};

export type GatewayConfigPaystack = {
  publicKey: string;
  secretKey?: string; // server stores; admin can set; storefront never sees
  channels?: string[]; // optional
};

export type GatewayConfigStripe = {
  publishableKey: string;
  secretKey?: string;
  connectedAccountId?: string | null;
};

export type StorePaymentMethodRow = {
  id: string;
  companyId: string;
  storeId: string;

  method: PaymentMethod;
  provider?: GatewayProvider | null;

  isEnabled: boolean;
  status: StorePaymentMethodStatus;
  lastError?: string | null;

  // admin endpoint may return full config
  config?: any;

  createdAt: string;
  updatedAt: string;
};

export type PaymentCategory = "online" | "manual";

export type PaymentIntegrationCard = {
  key: string; // e.g. "gateway:paystack" | "bank_transfer" | "cash"
  category: PaymentCategory; // ✅ for tabs/grouping
  method: "gateway" | "bank_transfer" | "cash" | "pos" | "manual";
  provider?: string | null; // for gateways

  title: string;
  description: string;

  icon: React.ReactNode;

  // optional image (brand logo)
  imageUrl?: string; // ✅ show logo in card header
  imageAlt?: string;

  fields?: Array<{
    key: string;
    label: string;
    placeholder?: string;
    required?: boolean;
    type: "text" | "textarea";
    secret?: boolean;
  }>;

  fromConfig: (row: any) => Record<string, any>;
  toConfig: (values: Record<string, any>) => Record<string, any>;

  enableWarning?: {
    title?: string;
    description?: string;
    confirmText?: string; // e.g. "Continue"
  };
};

// Gateway providers you support (extend safely)
export type PaymentGatewayProvider = "paystack" | "stripe" | "fincra";

// Manual methods (maps 1:1 to paymentMethodEnum)
export type ManualPaymentMethod = "bank_transfer" | "cash" | "pos";

// ----
// The IMPORTANT one you asked for 👇
// ----
export type PaymentMethodKey =
  | `gateway:${PaymentGatewayProvider}`
  | ManualPaymentMethod;
