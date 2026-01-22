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
import { useCommerceSalesTimeseries } from "../hooks/use-commerce-overview";
import {
  useChartRange,
  type ChartPreset,
} from "../../core/hooks/use-preset-range";
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

function fmtXAxis(iso: string, bucket: "day" | "month") {
  const d = new Date(iso);
  return bucket === "month"
    ? d.toLocaleDateString(undefined, { month: "short" })
    : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function fmtTooltipLabel(iso: string, bucket: "day" | "month") {
  const d = new Date(iso);
  return bucket === "month"
    ? d.toLocaleDateString(undefined, { month: "long", year: "numeric" })
    : d.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
}

export function CommerceSalesChart({
  session,
  activeStoreId,
}: {
  session: any;
  activeStoreId: string | null;
}) {
  const [preset, setPreset] = usePersistedState<ChartPreset>(
    "analytics:chart-preset",
    "30d",
  );

  const range = useChartRange(preset);
  const bucket = React.useMemo(
    () => (preset === "1y" ? "month" : "day"),
    [preset],
  );

  const ts = useCommerceSalesTimeseries(
    { ...range, bucket, storeId: activeStoreId },
    session,
  );
  const data = (ts.data ?? []) as SalesTimeseriesPoint[];

  const desc =
    preset === "1y"
      ? "Last 12 months"
      : preset === "30d"
        ? "Last 30 days"
        : "Last 7 days";

  return (
    <Card className="h-full px-3">
      <div className="flex items-center gap-2 space-y-0 py-3 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Sales over time</CardTitle>
          <CardDescription>{desc}</CardDescription>
        </div>

        <Select
          value={preset}
          onValueChange={(v) => setPreset(v as ChartPreset)}
        >
          <SelectTrigger
            className="w-40 rounded-lg sm:ml-auto"
            aria-label="Select a range"
          >
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent className="rounded-xl" align="end">
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="1y" className="rounded-lg">
              Last 12 months
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ✅ Make chart area fill the remaining height */}
      <div className="flex flex-col">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-80 w-full" // 🔧 increase from 250 -> 320
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
              tickFormatter={(v) => fmtXAxis(String(v), bucket)}
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
                    fmtTooltipLabel(String(value), bucket)
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
