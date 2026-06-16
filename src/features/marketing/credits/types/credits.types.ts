// features/credits/types/credits.types.ts
export type CreditChannel = "email" | "sms";
export type CreditTransactionType = "topup" | "send" | "refund" | "adjustment";

export type CreditBalance = {
  id: string;
  companyId: string;
  balance: number;
  lifetimeCredits: number;
  createdAt: string;
  updatedAt: string;
};

export type CreditTransaction = {
  id: string;
  companyId: string;
  channel: CreditChannel;
  type: CreditTransactionType;
  amount: number;
  balanceAfter: number;
  referenceType: string | null;
  referenceId: string | null;
  note: string | null;
  createdAt: string;
};

export type ListCreditTransactionsParams = {
  channel?: CreditChannel;
  limit?: number;
  offset?: number;
};

export type CreditTransactionsResponse = {
  rows: CreditTransaction[];
  count: number;
  limit: number;
  offset: number;
};
