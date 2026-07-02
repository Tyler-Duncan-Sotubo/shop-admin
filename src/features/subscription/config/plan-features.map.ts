// features/subscriptions/config/plan-features.map.ts
import { ENTERPRISE_PLAN_NAME } from "./plan-tier";
export type PlanName = "Free" | "Starter" | "Growth" | "Pro" | typeof ENTERPRISE_PLAN_NAME;

export type PlanFeatureKey =
  | "advancedShipping"
  | "analyticsBasic"
  | "analyticsDeep"
  | "apiAccess"
  | "barcodes"
  | "blogPosts"
  | "bulkActions"
  | "customDomain"
  | "customOrders"
  | "customerGroups"
  | "dispatch"
  | "emailCampaigns"
  | "facebookPixel"
  | "googleAnalytics"
  | "invoicing"
  | "multiLocation"
  | "pos"
  | "productReviews"
  | "quotes"
  | "revenueReports"
  | "shippingIntegrations"
  | "shippingZones"
  | "sms"
  | "staffActivityLogs"
  | "subscriberManagement"
  | "taxSettings"
  | "webhooks"
  | "zohoIntegration";

const PLAN_RANK: Record<PlanName, number> = {
  Free: 0,
  Starter: 1,
  Growth: 2,
  Pro: 3,
  [ENTERPRISE_PLAN_NAME]: 99,
};

export const FEATURE_MIN_PLAN: Record<PlanFeatureKey, PlanName> = {
  // ── Free ──────────────────────────────────────────────────
  analyticsBasic: "Free",
  // ── Starter ───────────────────────────────────────────────
  customOrders: "Starter",

  emailCampaigns: "Starter",
  invoicing: "Starter",
  shippingZones: "Starter",
  subscriberManagement: "Starter",
  taxSettings: "Starter",
  // ── Growth ────────────────────────────────────────────────
  analyticsDeep: "Growth",
  barcodes: "Growth",
  bulkActions: "Growth",
  customerGroups: "Growth",
  facebookPixel: "Growth",
  googleAnalytics: "Growth",
  multiLocation: "Growth",
  pos: "Growth",
  productReviews: "Growth",
  revenueReports: "Growth",
  shippingIntegrations: "Growth",
  sms: "Growth",
  staffActivityLogs: "Growth",
  // ── Pro ───────────────────────────────────────────────────
  advancedShipping: "Pro",
  apiAccess: "Pro",
  blogPosts: "Pro",
  customDomain: "Pro",
  webhooks: "Pro",
  zohoIntegration: "Pro",
  quotes: "Pro",
  dispatch: "Pro",
};

export function planHasFeature(
  planName: string,
  feature: PlanFeatureKey,
): boolean {
  const userRank = PLAN_RANK[planName as PlanName] ?? 0;
  const requiredRank = PLAN_RANK[FEATURE_MIN_PLAN[feature]];
  return userRank >= requiredRank;
}
