import { AnalyticsLandingPagesTable } from "@/features/analytics/pages/ui/analytics-landing-pages-table";
import { CommerceTopProductsTable } from "@/features/analytics/pages/ui/commerce-top-products-table";
import { RecentOrdersTable } from "@/features/analytics/pages/ui/recent-orders-table";
import { AnalyticsTopPagesTable } from "@/features/analytics/pages/ui/top-pages";

import { notFound } from "next/navigation";

export default async function AnalyticsPages({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = "top" } = await searchParams;

  if (
    tab !== "top" &&
    tab !== "landing-pages-for-analytics" &&
    tab !== "recent-orders" &&
    tab !== "top-products"
  ) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {tab === "top" && <AnalyticsTopPagesTable />}
      {tab === "landing-pages-for-analytics" && <AnalyticsLandingPagesTable />}
      {tab === "recent-orders" && <RecentOrdersTable />}
      {tab === "top-products" && <CommerceTopProductsTable />}
    </div>
  );
}
