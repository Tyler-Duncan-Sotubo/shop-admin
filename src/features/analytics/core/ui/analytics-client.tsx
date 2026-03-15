"use client";

import { AnalyticsOverviewToolbar } from "./analytics-overview-toolbar";
import { usePersistedState } from "../hooks/use-persisted-state";
import type { Preset } from "../hooks/use-preset-range";
import { usePresetRange } from "../hooks/use-preset-range";
import SalesAnalyticsClient from "./sales-analytics-client";
import { AnalyticsOverviewFeature } from "./anaytics-overview-feature";

type ExternalRange = { from: string; to: string };

export function AnalyticsClient({
  shouldShowHeader = true,
  externalRange,
}: {
  shouldShowHeader?: boolean;
  externalRange?: ExternalRange;
}) {
  const [preset, setPreset] = usePersistedState<Preset>(
    "web.analytics:preset",
    "today",
  );

  const presetRange = usePresetRange(preset);

  // if parent passes a range (e.g. from the tabs toolbar), use it
  // otherwise fall back to the internal preset picker
  const range = externalRange ?? presetRange;

  return (
    <div className="space-y-6">
      {/* only show the toolbar when we own the range */}
      {!externalRange && (
        <AnalyticsOverviewToolbar preset={preset} onPresetChange={setPreset} />
      )}
      <SalesAnalyticsClient range={range} />
      {shouldShowHeader && (
        <div>
          <h2 className="text-lg font-semibold">Web Analytics</h2>
        </div>
      )}
      <AnalyticsOverviewFeature range={range} />
    </div>
  );
}
