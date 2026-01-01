// src/features/analytics/commerce/hooks/use-date-presets.ts
"use client";

import { useMemo } from "react";

export type Preset = "today" | "7d" | "30d";
export type ChartPreset = "today" | "7d" | "30d" | "1y";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function addYears(d: Date, years: number) {
  const x = new Date(d);
  x.setFullYear(x.getFullYear() + years);
  return x;
}

export function usePresetRange(preset: Preset) {
  return useMemo(() => {
    const now = new Date();

    let from: Date;
    let to: Date;

    if (preset === "today") {
      from = startOfDay(now);
      to = startOfDay(addDays(now, 1)); // ✅ tomorrow 00:00 (exclusive)
    } else if (preset === "7d") {
      from = startOfDay(addDays(now, -6));
      to = now; // keep "up to now" for rolling ranges
    } else {
      from = startOfDay(addDays(now, -29));
      to = now;
    }

    return { from: from.toISOString(), to: to.toISOString() };
  }, [preset]);
}

export function useChartRange(preset: ChartPreset) {
  return useMemo(() => {
    const now = new Date();

    let from: Date;
    let to: Date;

    if (preset === "today") {
      from = startOfDay(now);
      to = startOfDay(addDays(now, 1)); // ✅ tomorrow 00:00 (exclusive)
    } else if (preset === "1y") {
      from = startOfDay(addYears(now, -1));
      to = now;
    } else if (preset === "30d") {
      from = startOfDay(addDays(now, -29));
      to = now;
    } else {
      // 7d
      from = startOfDay(addDays(now, -6));
      to = now;
    }

    return { from: from.toISOString(), to: to.toISOString() };
  }, [preset]);
}
