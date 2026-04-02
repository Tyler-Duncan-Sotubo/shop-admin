// src/shared/ui/compare-mode-picker.tsx
"use client";

import * as React from "react";
import type { DateRange } from "react-day-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { DateRangePicker } from "@/shared/ui/date-range-picker";
import type { CompareMode } from "@/features/analytics/extended/types/extended-analytics.type";

export function CompareModePicker({
  value,
  onChange,
  customRange,
  onCustomRangeChange,
}: {
  value: CompareMode;
  onChange: (mode: CompareMode) => void;
  customRange?: DateRange;
  onCustomRangeChange?: (range: DateRange | undefined) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Select value={value} onValueChange={(v) => onChange(v as CompareMode)}>
        <SelectTrigger className="h-6 w-40 text-xs" size="sm">
          <SelectValue placeholder="Compare" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="wow">Week over week</SelectItem>
          <SelectItem value="mom">Month over month</SelectItem>
          <SelectItem value="yoy">Year over year</SelectItem>
          <SelectItem value="custom">Custom range</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
