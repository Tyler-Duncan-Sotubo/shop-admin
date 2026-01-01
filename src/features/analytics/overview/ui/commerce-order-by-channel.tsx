/* eslint-disable @typescript-eslint/no-explicit-any */
// src/features/analytics/commerce/ui/commerce-orders-by-channel-pie.tsx
"use client";

import * as React from "react";
import { Pie, PieChart, Sector, Label } from "recharts";
import type { PieSectorDataItem } from "recharts/types/polar/Pie";

import { Card, CardDescription, CardTitle } from "@/shared/ui/card";
import {
  ChartContainer,
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

import { useCommerceOrdersByChannel } from "../hooks/use-commerce-overview";
import {
  useChartRange,
  type ChartPreset,
} from "../../core/hooks/use-preset-range";
import { usePersistedState } from "../../core/hooks/use-persisted-state";
import { formatMoneyNGN } from "@/shared/utils/format-to-naira";

type OrdersByChannelPoint = {
  channel: string; // "online" | "manual" | "pos" | "unknown"
  label: string; // pretty label
  value: number; // revenueMinor (we'll treat as revenue)
  ordersCount: number;
  revenueMinor: number;
};

function channelKey(c: string) {
  const v = String(c ?? "unknown").toLowerCase();
  if (v === "pos") return "pos";
  if (v === "manual") return "manual";
  if (v === "online") return "online";
  return "unknown";
}

const chartConfig = {
  value: { label: "Sales" },
  online: { label: "Online", color: "var(--chart-1)" },
  pos: { label: "POS", color: "var(--chart-2)" },
  manual: { label: "Manual", color: "var(--chart-3)" },
  unknown: { label: "Unknown", color: "var(--chart-4)" },
} satisfies ChartConfig;

export function CommerceOrdersByChannelPie({
  session,
  activeStoreId,
}: {
  session: any;
  activeStoreId: string | null;
}) {
  const [preset, setPreset] = usePersistedState<ChartPreset>(
    "analytics:channel-pie-preset",
    "30d"
  );

  const range = useChartRange(preset);

  // ✅ no UI filter for orders vs revenue — always revenue
  const q = useCommerceOrdersByChannel(
    { ...range, storeId: activeStoreId, metric: "revenue" },
    session
  );

  const data = React.useMemo(() => {
    const rows = (q.data ?? []) as OrdersByChannelPoint[];
    return (
      rows
        .map((r) => {
          const key = channelKey(r.channel);
          return {
            ...r,
            channelKey: key,
            // pie uses revenue
            value: Number(r.revenueMinor ?? r.value ?? 0),
            // ChartContainer uses --color-{key}
            fill: `var(--color-${key})`,
          };
        })
        // optional: hide 0 slices
        .filter((r) => Number(r.value) > 0)
    );
  }, [q.data]);

  const desc =
    preset === "1y"
      ? "Last 12 months"
      : preset === "30d"
      ? "Last 30 days"
      : "Last 7 days";

  const totalRevenueMinor = React.useMemo(
    () => data.reduce((acc, r) => acc + (Number(r.value) || 0), 0),
    [data]
  );

  const totalOrders = React.useMemo(
    () => data.reduce((acc, r) => acc + (Number(r.ordersCount) || 0), 0),
    [data]
  );

  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    setActiveIndex(0);
  }, [preset, activeStoreId]);

  return (
    <Card className="px-3">
      <div className="flex items-center gap-2 space-y-0 py-3 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Sales by channel</CardTitle>
          <CardDescription>{desc}</CardDescription>
        </div>

        {/* ✅ only range filter */}
        <Select
          value={preset}
          onValueChange={(v) => setPreset(v as ChartPreset)}
        >
          <SelectTrigger
            className="hidden w-40 rounded-lg sm:ml-auto sm:flex"
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

      <div className="pt-4 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[260px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(_value, _name, item) => {
                    const payload = item?.payload as any;
                    const revenueMinor = Number(payload?.value ?? 0);
                    return [formatMoneyNGN(revenueMinor, "NGN"), "Sales"];
                  }}
                />
              }
            />

            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius={60}
              strokeWidth={5}
              activeIndex={Math.min(activeIndex, Math.max(data.length - 1, 0))}
              onMouseEnter={(_, idx) => setActiveIndex(idx)}
              activeShape={({
                outerRadius = 0,
                ...props
              }: PieSectorDataItem) => (
                <Sector {...props} outerRadius={outerRadius + 10} />
              )}
            >
              <Label
                position="center"
                content={({ viewBox }) => {
                  if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox))
                    return null;

                  const cx = (viewBox as any).cx;
                  const cy = (viewBox as any).cy;

                  return (
                    <text
                      x={cx}
                      y={cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={cx}
                        y={cy}
                        className="fill-foreground text-lg font-semibold"
                      >
                        {new Intl.NumberFormat().format(totalOrders)}
                      </tspan>
                      <tspan
                        x={cx}
                        y={cy + 18}
                        className="fill-muted-foreground text-xs"
                      >
                        Total sales
                      </tspan>
                    </text>
                  );
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>

        {/* ✅ Legend/list under chart */}
        <div className="mt-4 space-y-2">
          {data.map((r) => {
            const pct =
              totalRevenueMinor > 0
                ? (Number(r.value) / totalRevenueMinor) * 100
                : 0;

            return (
              <div
                key={r.channelKey}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: `var(--color-${r.channelKey})` }}
                  />
                  <span className="text-muted-foreground">{r.label}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-medium">
                    {formatMoneyNGN(Number(r.value), "NGN")}
                  </span>
                  <span className="text-xs text-muted-foreground w-12 text-right">
                    {pct.toFixed(0)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* States */}
        {q.isLoading ? (
          <div className="mt-3 text-xs text-muted-foreground">Loading…</div>
        ) : !data.length ? (
          <div className="mt-3 text-xs text-muted-foreground">No data yet.</div>
        ) : null}
      </div>
    </Card>
  );
}
