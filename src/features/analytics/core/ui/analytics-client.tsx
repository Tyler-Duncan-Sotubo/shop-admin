"use client";

import { AnalyticsOverviewClient } from "./analytics-overview-client";
import { AnalyticsOverviewToolbar } from "./analytics-overview-toolbar";
import { usePersistedState } from "../hooks/use-persisted-state";
import { Preset, usePresetRange } from "../hooks/use-preset-range";
import SalesAnalyticsClient from "./sales-analytics-client";

export function AnalyticsClient() {
  const [preset, setPreset] = usePersistedState<Preset>(
    "web.analytics:preset",
    "today"
  );
  const range = usePresetRange(preset);

  return (
    <div className="space-y-6">
      <AnalyticsOverviewToolbar preset={preset} onPresetChange={setPreset} />
      <SalesAnalyticsClient range={range} />
      <div>
        <h2 className="text-lg font-semibold">Web Analytics</h2>
      </div>
      <AnalyticsOverviewClient range={range} />
    </div>
  );
}
