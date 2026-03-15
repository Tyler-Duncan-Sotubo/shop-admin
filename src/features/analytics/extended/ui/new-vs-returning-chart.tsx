"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/shared/ui/chart";
import { formatMoneyNGN } from "@/shared/utils/format-to-naira";
import type { NewVsReturningRow } from "../types/extended-analytics.type";
import { FiUserPlus, FiUsers } from "react-icons/fi";
import { TbCurrencyNaira } from "react-icons/tb";

const chartConfig = {
  newCustomers: { label: "New", color: "var(--chart-1)" },
  returningCustomers: { label: "Returning", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function NewVsReturningChart({
  data,
  isLoading,
}: {
  data?: NewVsReturningRow[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-[110px] rounded-xl border bg-white animate-pulse"
            />
          ))}
        </div>
        <div className="h-64 rounded-xl bg-muted/30 animate-pulse" />
      </div>
    );
  }

  if (!data?.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No customer data for this period.
      </p>
    );
  }

  const totalNew = data.reduce((s, r) => s + r.newCustomers, 0);
  const totalReturning = data.reduce((s, r) => s + r.returningCustomers, 0);
  const totalRevNew = data.reduce((s, r) => s + r.newRevenue, 0);
  const totalRevReturning = data.reduce((s, r) => s + r.returningRevenue, 0);

  const cards = [
    {
      label: "New customers",
      value: new Intl.NumberFormat().format(totalNew),
      icon: <FiUserPlus size={14} />,
      iconColor: "text-violet-500",
    },
    {
      label: "Returning customers",
      value: new Intl.NumberFormat().format(totalReturning),
      icon: <FiUsers size={14} />,
      iconColor: "text-blue-500",
    },
    {
      label: "New revenue",
      value: formatMoneyNGN(totalRevNew, "NGN"),
      icon: <TbCurrencyNaira size={14} />,
      iconColor: "text-cyan-500",
    },
    {
      label: "Returning revenue",
      value: formatMoneyNGN(totalRevReturning, "NGN"),
      icon: <TbCurrencyNaira size={14} />,
      iconColor: "text-indigo-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border bg-white p-4 min-h-[110px] flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground">
                {s.label}
              </span>
              <span className={s.iconColor}>{s.icon}</span>
            </div>
            <div className="text-base font-bold text-foreground">{s.value}</div>
          </div>
        ))}
      </div>

      <ChartContainer config={chartConfig} className="h-64 w-full">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="fillNew" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-newCustomers)"
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor="var(--color-newCustomers)"
                stopOpacity={0}
              />
            </linearGradient>
            <linearGradient id="fillReturning" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-returningCustomers)"
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor="var(--color-returningCustomers)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="period"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={32}
            tickFormatter={(v) =>
              new Date(v).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })
            }
          />
          <YAxis tickLine={false} axisLine={false} width={32} />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(v) =>
                  new Date(v).toLocaleDateString(undefined, {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                }
              />
            }
          />
          <Area
            dataKey="newCustomers"
            type="monotone"
            fill="url(#fillNew)"
            stroke="var(--color-newCustomers)"
            strokeWidth={2}
            stackId="a"
          />
          <Area
            dataKey="returningCustomers"
            type="monotone"
            fill="url(#fillReturning)"
            stroke="var(--color-returningCustomers)"
            strokeWidth={2}
            stackId="a"
          />
          <ChartLegend content={<ChartLegendContent />} />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
