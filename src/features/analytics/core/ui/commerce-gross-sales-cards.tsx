"use client";

import * as React from "react";
import { TbTargetArrow } from "react-icons/tb";
import { FiShoppingCart } from "react-icons/fi";
import { MdOutlineLocalShipping } from "react-icons/md";
import { PiPauseCircleBold } from "react-icons/pi";
import { fmtCompactMajor } from "@/shared/utils/format-to-naira";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

function fmtInt(n: number) {
  return new Intl.NumberFormat().format(Math.round(n));
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
    <div className={`flex items-center gap-1 text-[10px] font-semibold ${cls}`}>
      {isZero ? null : good ? (
        <ArrowUpRight className="h-3 w-3" />
      ) : (
        <ArrowDownRight className="h-3 w-3" />
      )}
      <span>{fmtPctSigned(pct)}</span>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
  iconColor,
  deltaPct,
  invertDeltaGood,
  isLoading,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconColor: string;
  deltaPct: number | null;
  invertDeltaGood?: boolean;
  isLoading?: boolean;
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
        <div className="text-lg font-bold text-foreground">
          {isLoading ? "" : value}
        </div>
        {!isLoading && <Delta pct={deltaPct} invertGood={invertDeltaGood} />}
      </div>
    </div>
  );
}

type GrossCardsData = {
  grossSalesMinor?: number | null;
  fulfilledOrders?: number | null;
  onHoldOrders?: number | null;
  totalOrders?: number | null;
  deltas?: {
    grossSalesMinor?: { changePct?: number | null } | null;
    fulfilledOrders?: { changePct?: number | null } | null;
    onHoldOrders?: { changePct?: number | null } | null;
    totalOrders?: { changePct?: number | null } | null;
  } | null;
};

export function CommerceGrossSalesCards({
  data,
  isLoading,
}: {
  hasRangeSelector?: boolean;
  data?: GrossCardsData | null;
  isLoading?: boolean;
}) {
  const d = data;

  if (isLoading || !d) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="min-h-[110px] rounded-xl border bg-white animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Stat
        label="Gross sales"
        value={fmtCompactMajor(
          ((d.grossSalesMinor ?? 0) as number) / 100,
          "NGN",
        )}
        icon={<TbTargetArrow size={14} />}
        iconColor="text-emerald-500"
        deltaPct={d.deltas?.grossSalesMinor?.changePct ?? null}
      />
      <Stat
        label="Orders fulfilled"
        value={fmtInt((d.fulfilledOrders ?? 0) as number)}
        icon={<MdOutlineLocalShipping size={14} />}
        iconColor="text-indigo-500"
        deltaPct={d.deltas?.fulfilledOrders?.changePct ?? null}
      />
      <Stat
        label="Orders on hold"
        value={fmtInt((d.onHoldOrders ?? 0) as number)}
        icon={<PiPauseCircleBold size={14} />}
        iconColor="text-amber-500"
        deltaPct={d.deltas?.onHoldOrders?.changePct ?? null}
        invertDeltaGood
      />
      <Stat
        label="Total orders"
        value={fmtInt((d.totalOrders ?? 0) as number)}
        icon={<FiShoppingCart size={14} />}
        iconColor="text-violet-500"
        deltaPct={d.deltas?.totalOrders?.changePct ?? null}
      />
    </div>
  );
}
