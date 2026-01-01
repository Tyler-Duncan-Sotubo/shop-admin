"use client";

import * as React from "react";
import { TbTargetArrow } from "react-icons/tb";
import { FiShoppingCart } from "react-icons/fi";
import { MdOutlineLocalShipping } from "react-icons/md";
import { PiPauseCircleBold } from "react-icons/pi";
import { formatMoneyNGN } from "@/shared/utils/format-to-naira";
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
}: {
  label: string;
  value: string;
  icon: React.ReactNode;

  iconBg: string; // kept for API compatibility
  cardBg?: string;

  deltaPct: number | null;
  invertDeltaGood?: boolean;
}) {
  return (
    <div className={`rounded-xl p-6 ${cardBg ?? "bg-background"}`}>
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center rounded-full">
          <div className="text-black font-bold">{icon}</div>
        </div>
        <div className="text-sm font-semibold text-muted-foreground">
          {label}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div className="text-lg font-bold">{value}</div>
        <Delta pct={deltaPct} invertGood={invertDeltaGood} />
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
  // NOTE:
  // When using the bundle approach, "data" + "isLoading" come from parent.
  // If you still want this component to be usable standalone later,
  // you can add a `fetch` flag and reintroduce the hook in a separate version.

  const d = data;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Gross sales"
          value={
            isLoading
              ? ""
              : formatMoneyNGN(
                  ((d?.grossSalesMinor ?? 0) as number) / 100,
                  "NGN"
                )
          }
          icon={<TbTargetArrow size={18} />}
          iconBg="bg-emerald-600"
          cardBg="bg-emerald-50"
          deltaPct={d?.deltas?.grossSalesMinor?.changePct ?? null}
        />

        <Stat
          label="Orders fulfilled"
          value={isLoading ? "" : fmtInt((d?.fulfilledOrders ?? 0) as number)}
          icon={<MdOutlineLocalShipping size={18} />}
          iconBg="bg-indigo-600"
          cardBg="bg-indigo-50"
          deltaPct={d?.deltas?.fulfilledOrders?.changePct ?? null}
        />

        <Stat
          label="Orders on hold"
          value={isLoading ? "" : fmtInt((d?.onHoldOrders ?? 0) as number)}
          icon={<PiPauseCircleBold size={18} />}
          iconBg="bg-amber-600"
          cardBg="bg-amber-50"
          deltaPct={d?.deltas?.onHoldOrders?.changePct ?? null}
          invertDeltaGood
        />

        <Stat
          label="Total orders"
          value={isLoading ? "" : fmtInt((d?.totalOrders ?? 0) as number)}
          icon={<FiShoppingCart size={18} />}
          iconBg="bg-violet-600"
          cardBg="bg-violet-50"
          deltaPct={d?.deltas?.totalOrders?.changePct ?? null}
        />
      </div>
    </div>
  );
}
