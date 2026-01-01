// src/features/analytics/overview/ui/analytics-overview-client.tsx
"use client";

import { AnalyticsOverviewFeature } from "./anaytics-overview-feature";

export function AnalyticsOverviewClient({
  range,
}: {
  range: { from: string; to: string; storeId?: string | null };
}) {
  return (
    <div className="space-y-6">
      <AnalyticsOverviewFeature range={range} />
    </div>
  );
}
