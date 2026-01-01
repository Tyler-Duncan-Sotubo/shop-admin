"use client";

import { FiEye, FiUsers, FiLayers, FiCornerDownLeft } from "react-icons/fi";
import type { DashboardOverview } from "../types/dashboard-analytics.type";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Skeleton } from "@/shared/ui/skeleton";

function fmtInt(n: number) {
  return new Intl.NumberFormat().format(Math.round(n));
}

function fmtPct01(n01: number) {
  const pct = Math.max(0, Math.min(1, n01)) * 100;
  return `${pct.toFixed(1)}%`;
}

function fmtPctSigned(p: number | null) {
  if (p === null) return "—";
  const sign = p > 0 ? "+" : "";
  return `${sign}${(p * 100).toFixed(1)}%`;
}

function Delta({
  pct,
  invertGood,
}: {
  pct: number | null;
  invertGood?: boolean;
}) {
  if (pct === null) return <span className="text-xs text-muted-foreground" />;

  const good = invertGood ? pct < 0 : pct > 0;
  const isZero = pct === 0;

  const cls = good
    ? "text-emerald-600"
    : isZero
    ? "text-muted-foreground"
    : "text-red-600";

  return (
    <div className={`flex items-center gap-1 text-xs font-semibold ${cls}`}>
      {isZero ? null : good ? (
        <ArrowUpRight className="h-4 w-4" />
      ) : (
        <ArrowDownRight className="h-4 w-4" />
      )}
      <span>{fmtPctSigned(pct)}</span>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
  cardBg,
  deltaPct,
  invertDeltaGood,
  isLoading,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;

  iconBg: string;
  cardBg?: string;

  deltaPct: number | null;
  invertDeltaGood?: boolean;
  isLoading?: boolean;
}) {
  return (
    <div className={`rounded-xl p-4 ${cardBg ?? "bg-background"}`}>
      {/* Top: icon + label */}
      <div className="flex items-center gap-2">
        <div
          className={`flex h-5 w-5 items-center justify-center rounded-full`}
        >
          <div className="text-black">{icon}</div>
        </div>

        <div className="text-xs font-semibold text-muted-foreground">
          {label}
        </div>
      </div>

      {/* Value + delta */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          {isLoading ? (
            <Skeleton className="h-5 w-24" />
          ) : (
            <div className="text-lg font-bold">{value}</div>
          )}
        </div>

        {isLoading ? (
          <Skeleton className="h-4 w-14" />
        ) : (
          <Delta pct={deltaPct} invertGood={invertDeltaGood} />
        )}
      </div>
    </div>
  );
}

export function AnalyticsOverviewCards({
  data,
  isLoading,
}: {
  data?: DashboardOverview | null;
  isLoading?: boolean;
}) {
  const pageViews = fmtInt(data?.pageViews ?? 0);
  const visits = fmtInt(data?.visits ?? 0);
  const pagesPerVisit = (data?.pagesPerVisit ?? 0).toFixed(2);
  const bounceRate = fmtPct01(data?.bounceRate ?? 0);

  const deltas = data?.deltas;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Stat
        label="Page views"
        value={pageViews}
        icon={<FiEye size={18} />}
        iconBg="bg-blue-600"
        cardBg="bg-blue-50"
        deltaPct={deltas?.pageViews?.changePct ?? null}
        isLoading={isLoading}
      />

      <Stat
        label="Visits"
        value={visits}
        icon={<FiUsers size={18} />}
        iconBg="bg-emerald-600"
        cardBg="bg-emerald-50"
        deltaPct={deltas?.visits?.changePct ?? null}
        isLoading={isLoading}
      />

      <Stat
        label="Pages / visit"
        value={pagesPerVisit}
        icon={<FiLayers size={18} />}
        iconBg="bg-violet-600"
        cardBg="bg-violet-50"
        deltaPct={deltas?.pagesPerVisit?.changePct ?? null}
        isLoading={isLoading}
      />

      <Stat
        label="Bounce rate"
        value={bounceRate}
        icon={<FiCornerDownLeft size={18} />}
        iconBg="bg-amber-600"
        cardBg="bg-amber-50"
        deltaPct={deltas?.bounceRate?.changePct ?? null}
        invertDeltaGood
        isLoading={isLoading}
      />
    </div>
  );
}
