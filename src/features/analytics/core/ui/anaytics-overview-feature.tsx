"use client";

import { useSession } from "next-auth/react";
import {
  useDashboardOverview,
  useDashboardTopPages,
  useDashboardLandingPages,
} from "../hooks/use-dashboard-overview";
import { AnalyticsOverviewCards } from "./analytics-overview-cards";
import { LandingPagesCard } from "./landing-card";
import { TopPagesCard } from "./top-page-card";
import { useStoreScope } from "@/lib/providers/store-scope-provider";

export function AnalyticsOverviewFeature({
  range,
}: {
  range: { from: string; to: string; storeId?: string | null };
}) {
  const { data: session } = useSession();
  const { activeStoreId } = useStoreScope();

  // Fetch data for overview, top pages, and landing pages
  const overview = useDashboardOverview(
    { ...range, storeId: activeStoreId },
    session,
  );
  const topPages = useDashboardTopPages(
    { ...range, limit: 5, storeId: activeStoreId },
    session,
  );
  const landings = useDashboardLandingPages(
    { ...range, limit: 5, storeId: activeStoreId },
    session,
  );

  return (
    <div className="space-y-6">
      <AnalyticsOverviewCards
        data={overview.data ?? null}
        isLoading={overview.isLoading}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <TopPagesCard
            rows={topPages.data ?? null}
            isLoading={topPages.isLoading}
          />
        </div>
        <LandingPagesCard
          rows={landings.data ?? null}
          isLoading={landings.isLoading}
        />
      </div>
    </div>
  );
}
