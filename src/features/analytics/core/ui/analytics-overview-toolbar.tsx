"use client";

import PageHeader from "@/shared/ui/page-header";
import type { Preset } from "../hooks/use-preset-range";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

export function AnalyticsOverviewToolbar({
  preset,
  onPresetChange,
}: {
  preset: Preset;
  onPresetChange: (p: Preset) => void;
}) {
  return (
    <PageHeader
      title="Analytics Overview"
      description={`Overview of your store's performance ${preset}`}
    >
      <Select value={preset} onValueChange={(v) => onPresetChange(v as Preset)}>
        <SelectTrigger className="h-8 w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="7d">Last 7 days</SelectItem>
          <SelectItem value="30d">Last 30 days</SelectItem>
        </SelectContent>
      </Select>
    </PageHeader>
  );
}
