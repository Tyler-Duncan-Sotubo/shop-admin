// features/subscriptions/types/subscriptions.types.ts
export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "cancelled"
  | "expired";

export type BillingCycle = "monthly" | "annual";

export type TopupStatus = "pending" | "paid" | "failed" | "refunded";

export type PlanFeatures = {
  maxStores: number;
  maxTeamMembers: number;
  sms: boolean;
  emailCampaigns: boolean;
  analytics: boolean;
  analyticsRetentionDays: number;
  customDomain: boolean;
  prioritySupport: boolean;
};

export type SubscriptionPlan = {
  id: string;
  name: string;
  description: string | null;
  monthlyPriceNGN: number;
  annualPriceNGN: number;
  monthlyCredits: number;
  features: PlanFeatures;
  paystackMonthlyPlanCode: string | null;
  paystackAnnualPlanCode: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type CompanySubscription = {
  id: string;
  companyId: string;
  planId: string;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  trialEndsAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  paystackCustomerCode: string | null;
  paystackSubscriptionCode: string | null;
  paystackEmailToken: string | null;
  createdAt: string;
  updatedAt: string;
  plan: SubscriptionPlan;
};

export type CreditBundle = {
  credits: number;
  amountNGN: number;
  label: string;
};

export type InitiateTopupResponse = {
  reference: string;
  authorizationUrl: string;
  accessCode: string;
  credits: number;
  amountNGN: number;
};

export type CreditTopupRequest = {
  id: string;
  companyId: string;
  credits: number;
  amountNGN: number;
  status: TopupStatus;
  paystackReference: string;
  paystackAccessCode: string | null;
  paidAt: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

// features/subscriptions/types/subscriptions.types.ts — add
export type SubscriptionInvoiceType = "subscription" | "credit_topup";
export type SubscriptionInvoiceStatus = "paid" | "failed" | "refunded";

export type SubscriptionInvoice = {
  id: string;
  companyId: string;
  subscriptionId: string | null;
  topupRequestId: string | null;
  type: SubscriptionInvoiceType;
  status: SubscriptionInvoiceStatus;
  amountNGN: number;
  paystackReference: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
};
