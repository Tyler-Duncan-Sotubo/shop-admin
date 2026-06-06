/* eslint-disable @typescript-eslint/no-explicit-any */
// src/features/analytics/commerce/ui/commerce-sales-chart.tsx
"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, Line, XAxis, YAxis } from "recharts";
import { Card, CardDescription, CardTitle } from "@/shared/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

import { formatMoneyNGN } from "@/shared/utils/format-to-naira";
import {
  useCommerceSalesTimeseries,
  type SalesChartPreset,
} from "../hooks/use-commerce-overview";
import { usePersistedState } from "../../core/hooks/use-persisted-state";

type SalesTimeseriesPoint = {
  t: string;
  orders: number;
  salesMinor: number;
};

const chartConfig = {
  salesMinor: { label: "Sales", color: "var(--chart-1)" },
  orders: { label: "Orders", color: "var(--chart-2)" },
} satisfies ChartConfig;

function isIntraday(preset: SalesChartPreset) {
  return (
    preset === "30m" ||
    preset === "12h" ||
    preset === "today" ||
    preset === "yesterday"
  );
}

function fmtXAxis(iso: string, preset: SalesChartPreset) {
  const d = new Date(iso);

  if (isIntraday(preset)) {
    return d.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  if (preset === "12m") {
    return d.toLocaleDateString(undefined, { month: "short" });
  }

  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function fmtTooltipLabel(iso: string, preset: SalesChartPreset) {
  const d = new Date(iso);

  if (isIntraday(preset)) {
    return d.toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      year: "numeric",
    });
  }

  if (preset === "12m") {
    return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  }

  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function presetDesc(preset: SalesChartPreset) {
  switch (preset) {
    case "today":
      return "Today";
    case "yesterday":
      return "Yesterday";
    case "30m":
      return "Last 30 minutes";
    case "12h":
      return "Last 12 hours";
    case "last_week":
      return "Last week";
    case "last_month":
      return "Last month";
    case "7d":
      return "Last 7 days";
    case "30d":
      return "Last 30 days";
    case "90d":
      return "Last 90 days";
    case "365d":
      return "Last 365 days";
    case "12m":
      return "Last 12 months";
    default:
      return "Sales over time";
  }
}

export function CommerceSalesChart({
  session,
  activeStoreId,
}: {
  session: any;
  activeStoreId: string | null;
}) {
  const [preset, setPreset] = usePersistedState<SalesChartPreset>(
    "analytics:chart-preset",
    "30d",
  );

  const ts = useCommerceSalesTimeseries(
    { preset, storeId: activeStoreId },
    session,
  );

  const data = (ts.data ?? []) as SalesTimeseriesPoint[];

  return (
    <Card className="h-full px-3">
      <div className="flex items-center gap-2 space-y-0 py-3 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Sales over time</CardTitle>
          <CardDescription>{presetDesc(preset)}</CardDescription>
        </div>

        <Select
          value={preset}
          onValueChange={(v) => setPreset(v as SalesChartPreset)}
        >
          <SelectTrigger
            className="w-44 rounded-lg sm:ml-auto"
            aria-label="Select a range"
          >
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent className="rounded-xl" align="end">
            <SelectItem value="today" className="rounded-lg">
              Today
            </SelectItem>
            <SelectItem value="yesterday" className="rounded-lg">
              Yesterday
            </SelectItem>
            <SelectItem value="12h" className="rounded-lg">
              Last 12 hours
            </SelectItem>
            <SelectItem value="30m" className="rounded-lg">
              Last 30 minutes
            </SelectItem>

            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="90d" className="rounded-lg">
              Last 90 days
            </SelectItem>
            <SelectItem value="365d" className="rounded-lg">
              Last 365 days
            </SelectItem>

            <SelectItem value="last_week" className="rounded-lg">
              Last week
            </SelectItem>
            <SelectItem value="last_month" className="rounded-lg">
              Last month
            </SelectItem>
            <SelectItem value="12m" className="rounded-lg">
              Last 12 months
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-80 w-full"
        >
          <AreaChart data={data}>
            <defs>
              <linearGradient id="fillSales" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-salesMinor)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-salesMinor)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="t"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(v) => fmtXAxis(String(v), preset)}
            />

            <YAxis
              domain={[0, "dataMax"]}
              tickLine={false}
              axisLine={false}
              width={40}
              tickFormatter={(v) => {
                const n = Number(v);
                if (!Number.isFinite(n)) return "";
                return new Intl.NumberFormat(undefined, {
                  notation: "compact",
                }).format(n);
              }}
            />

            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  labelFormatter={(value) =>
                    fmtTooltipLabel(String(value), preset)
                  }
                  formatter={(value, name) => {
                    if (name === "salesMinor") {
                      return [formatMoneyNGN(Number(value), "NGN"), "Revenue"];
                    }
                    if (name === "orders") {
                      return [
                        new Intl.NumberFormat().format(Number(value)),
                        "Orders",
                      ];
                    }
                    return [String(value), String(name)];
                  }}
                />
              }
            />

            <Area
              dataKey="salesMinor"
              type="monotone"
              fill="url(#fillSales)"
              stroke="var(--color-salesMinor)"
              strokeWidth={2}
            />

            <Line
              dataKey="orders"
              type="monotone"
              stroke="var(--color-orders)"
              strokeWidth={2}
              dot={false}
            />

            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>

        {ts.isLoading ? (
          <div className="mt-3 text-xs text-muted-foreground">Loading…</div>
        ) : !data.length ? (
          <div className="mt-3 text-xs text-muted-foreground">No data yet.</div>
        ) : null}
      </div>
    </Card>
  );
}
