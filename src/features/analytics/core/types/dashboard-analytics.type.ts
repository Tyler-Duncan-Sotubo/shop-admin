// src/features/analytics/overview/types/dashboard-analytics.type.ts
export type DashboardRangeParams = {
  from: string; // ISO string
  to: string; // ISO string
  storeId?: string | null;
};

export type DashboardOverview = {
  pageViews: number;
  visits: number;
  pagesPerVisit: number;
  bounceRate: number; // 0..1

  // future KPIs
  orders: number | null;
  revenue: number | null;
  conversionRate: number | null;
  aov: number | null;
  deltas?: {
    pageViews: { change: number; changePct: number | null };
    visits: { change: number; changePct: number | null };
    pagesPerVisit: { change: number; changePct: number | null };
    bounceRate: { change: number; changePct: number | null };
  };
};

export type TopPageRow = {
  path: string;
  title: string;
  pageViews: number;
  visits: number;
};

export type LandingPageRow = {
  path: string;
  title: string;
  visits: number;
};
