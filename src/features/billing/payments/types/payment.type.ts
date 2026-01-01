export type PaymentMethod = "bank_transfer" | "cash" | "card_manual" | "other";
export type PaymentStatus = "pending" | "confirmed" | "failed" | "cancelled"; // adjust to your enum

export type Payment = {
  id: string;
  companyId: string;

  orderId?: string | null;
  invoiceId?: string | null;

  method: PaymentMethod;
  status: PaymentStatus;

  currency: string;
  amountMinor: number;

  reference?: string | null;

  provider?: string | null; // "paystack"
  providerRef?: string | null;
  providerEventId?: string | null;

  receivedAt?: string | null;
  confirmedAt?: string | null;

  createdByUserId?: string | null;
  confirmedByUserId?: string | null;

  meta?: unknown;
  createdAt: string;
};

export type ListPaymentsParams = {
  invoiceId?: string;
  orderId?: string;
  limit?: number;
  offset?: number;
  storeId?: string | null;
};
