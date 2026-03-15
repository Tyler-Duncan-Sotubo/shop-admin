"use client";

import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { FiClock, FiCheckCircle, FiPackage } from "react-icons/fi";
import type { Delta, FulfillmentStats } from "../types/extended-analytics.type";

function fmtPct(p: number | null) {
  if (p === null) return "—";
  const sign = p > 0 ? "+" : "";
  return `${sign}${(p * 100).toFixed(1)}%`;
}

function DeltaBadge({
  delta,
  invertGood,
}: {
  delta: Delta;
  invertGood?: boolean;
}) {
  const pct = delta.changePct;
  if (pct === null) return null;
  const good = invertGood ? pct < 0 : pct > 0;
  const isZero = pct === 0;
  const cls = isZero
    ? "text-muted-foreground"
    : good
      ? "text-emerald-600"
      : "text-red-600";

  return (
    <div
      className={`flex items-center gap-0.5 text-[10px] font-semibold ${cls}`}
    >
      {!isZero &&
        (good ? (
          <ArrowUpRight className="h-3 w-3" />
        ) : (
          <ArrowDownRight className="h-3 w-3" />
        ))}
      {fmtPct(pct)}
    </div>
  );
}

function StatCard({
  label,
  value,
  subvalue,
  delta,
  icon,
  iconColor,
  invertGood,
}: {
  label: string;
  value: string;
  subvalue?: string;
  delta: Delta;
  icon: React.ReactNode;
  iconColor: string;
  invertGood?: boolean;
}) {
  return (
    <div className="rounded-xl border bg-white p-4 min-h-[110px] flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-muted-foreground">
          {label}
        </span>
        <span className={iconColor}>{icon}</span>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-lg font-bold text-foreground">{value}</div>
          {subvalue && (
            <div className="text-xs text-muted-foreground">{subvalue}</div>
          )}
        </div>
        <DeltaBadge delta={delta} invertGood={invertGood} />
      </div>
    </div>
  );
}

export function FulfillmentCards({
  data,
  isLoading,
}: {
  data?: FulfillmentStats;
  isLoading: boolean;
}) {
  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="min-h-[100px] rounded-xl border bg-white animate-pulse"
          />
        ))}
      </div>
    );
  }

  const avgHours = data.avgFulfillmentHours.current;
  const avgDisplay =
    avgHours < 24
      ? `${avgHours.toFixed(1)}h`
      : `${(avgHours / 24).toFixed(1)}d`;

  const prevHours = data.avgFulfillmentHours.previous;
  const prevDisplay =
    prevHours < 24
      ? `${prevHours.toFixed(1)}h`
      : `${(prevHours / 24).toFixed(1)}d`;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <StatCard
        label="Avg Fulfillment Time"
        value={avgDisplay}
        subvalue={`prev: ${prevDisplay}`}
        delta={data.avgFulfillmentHours}
        icon={<FiClock size={14} />}
        iconColor="text-amber-500"
        invertGood
      />
      <StatCard
        label="On-Time Rate"
        value={`${(data.onTimeRate.current * 100).toFixed(1)}%`}
        subvalue="within 48h"
        delta={data.onTimeRate}
        icon={<FiCheckCircle size={14} />}
        iconColor="text-emerald-500"
      />
      <StatCard
        label="Orders Fulfilled"
        value={new Intl.NumberFormat().format(data.totalFulfilled.current)}
        delta={data.totalFulfilled}
        icon={<FiPackage size={14} />}
        iconColor="text-blue-500"
      />
    </div>
  );
}
