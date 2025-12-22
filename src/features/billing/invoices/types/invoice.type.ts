/* eslint-disable @typescript-eslint/no-explicit-any */
export type InvoiceStatus =
  | "draft"
  | "issued"
  | "partially_paid"
  | "paid"
  | "void"
  | "overdue";

export type Invoice = {
  id: string;
  type?: string; // "invoice" | "credit_note" etc
  number?: string | null;

  status: InvoiceStatus;
  currency: string;

  subtotalMinor: number;
  taxMinor: number;
  totalMinor: number;

  paidMinor: number;
  balanceMinor: number;

  storeId?: string | null;
  orderId?: string | null;

  issuedAt?: string | null;
  dueAt?: string | null;
  createdAt?: string;
  updatedAt?: string;

  meta?: any;
  customerSnapshot?: any; // if you store this on invoice
};

export type InvoiceLine = {
  id: string;
  invoiceId: string;
  orderId?: string | null;

  position: number;
  description: string;
  quantity: number;

  productId?: string | null;
  variantId?: string | null;

  unitPriceMinor: number;
  discountMinor: number;

  lineNetMinor: number;
  taxMinor: number;
  lineTotalMinor: number;

  taxId?: string | null;
  taxName?: string | null;
  taxRateBps: number;
  taxInclusive: boolean;

  taxExempt: boolean;
  taxExemptReason?: string | null;

  meta?: any;
};

export type InvoiceWithLines = {
  invoice: Invoice;
  lines: InvoiceLine[];
};
