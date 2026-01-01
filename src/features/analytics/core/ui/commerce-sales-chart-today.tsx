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
import { formatMoneyNGN } from "@/shared/utils/format-to-naira";

type Bucket = "15m" | "day" | "month";
type SalesTimeseriesPoint = { t: string; orders: number; salesMinor: number };

const chartConfig = {
  salesMinor: { label: "Sales", color: "var(--chart-1)" },
  orders: { label: "Orders", color: "var(--chart-2)" },
} satisfies ChartConfig;

function diffDays(fromIso: string, toIso: string) {
  const from = new Date(fromIso).getTime();
  const to = new Date(toIso).getTime();
  const ms = Math.max(0, to - from);
  return ms / (24 * 60 * 60 * 1000);
}

function fmtXAxis(iso: string, bucket: Bucket) {
  const d = new Date(iso);
  if (bucket === "15m") {
    return d.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  if (bucket === "month") {
    return d.toLocaleDateString(undefined, { month: "short" });
  }
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function fmtTooltipLabel(iso: string, bucket: Bucket) {
  const d = new Date(iso);
  if (bucket === "15m") {
    return d.toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  if (bucket === "month") {
    return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  }
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function CommerceSalesChartToday({
  range,
  title = "Sales over time",
  description,
  data,
  isLoading,
  bucket: bucketProp,
}: {
  // keep range so we can infer bucket if parent doesn’t pass it
  range: { from: string; to: string };
  title?: string;
  description?: string;

  // ✅ passed from parent bundle
  data: SalesTimeseriesPoint[] | null | undefined;
  isLoading?: boolean;

  // ✅ parent can pass bucket (preferred)
  bucket?: Bucket;
}) {
  // ✅ infer bucket from range length (only used if parent didn’t pass bucket)
  const inferredBucket = React.useMemo<Bucket>(() => {
    const days = diffDays(range.from, range.to);
    if (days <= 1.05) return "15m";
    if (days >= 330) return "month";
    return "day";
  }, [range.from, range.to]);

  const bucket = bucketProp ?? inferredBucket;

  const safeData = (data ?? []) as SalesTimeseriesPoint[];

  return (
    <Card className="h-full px-3">
      <div className="flex items-center gap-2 space-y-0 py-3 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            {description ??
              (bucket === "15m"
                ? "Today"
                : bucket === "month"
                ? "Last 12 months"
                : "Daily")}
          </CardDescription>
        </div>
      </div>

      <div className="flex flex-col">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-80 w-full"
        >
          <AreaChart data={safeData}>
            <defs>
              <linearGradient id="fillSalesFlex" x1="0" y1="0" x2="0" y2="1">
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
              minTickGap={24}
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
              fill="url(#fillSalesFlex)"
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

        {isLoading ? (
          <div className="mt-3 text-xs text-muted-foreground">Loading…</div>
        ) : !safeData.length ? (
          <div className="mt-3 text-xs text-muted-foreground">No data yet.</div>
        ) : null}
      </div>
    </Card>
  );
}
