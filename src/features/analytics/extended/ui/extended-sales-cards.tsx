"use client";

import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { TbCurrencyNaira } from "react-icons/tb";
import { FiPercent, FiTag, FiAlertCircle, FiShoppingBag } from "react-icons/fi";
import { fmtCompactMajor } from "@/shared/utils/format-to-naira";
import type {
  Delta,
  ExtendedSalesCards,
} from "../types/extended-analytics.type";

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
  if (pct === null)
    return <span className="text-xs text-muted-foreground">—</span>;

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

type CardConfig = {
  label: string;
  value: string;
  delta: Delta;
  icon: React.ReactNode;
  iconColor: string;
  invertGood?: boolean;
  prevLabel: string;
};

function Card({
  label,
  value,
  delta,
  icon,
  iconColor,
  invertGood,
  prevLabel,
}: CardConfig) {
  return (
    <div className="rounded-xl border bg-white p-4 min-h-[110px] flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-muted-foreground truncate pr-2">
          {label}
        </span>
        <span className={`${iconColor} shrink-0`}>{icon}</span>
      </div>
      <div>
        <div className="flex items-end justify-between gap-1">
          <span
            className="text-base font-bold text-foreground truncate min-w-0"
            title={value}
          >
            {value}
          </span>
          <DeltaBadge delta={delta} invertGood={invertGood} />
        </div>
        <div
          className="text-[10px] text-muted-foreground mt-1 truncate"
          title={`vs ${prevLabel} prev period`}
        >
          vs {prevLabel} prev period
        </div>
      </div>
    </div>
  );
}

export function ExtendedSalesCards({
  data,
  isLoading,
}: {
  data?: ExtendedSalesCards;
  isLoading: boolean;
}) {
  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="min-h-[110px] rounded-xl border bg-white animate-pulse"
          />
        ))}
      </div>
    );
  }

  const cards: CardConfig[] = [
    {
      label: "Gross Sales",
      value: fmtCompactMajor(data.grossSalesMinor.current, "NGN"),
      delta: data.grossSalesMinor,
      icon: <TbCurrencyNaira size={14} />,
      iconColor: "text-violet-500",
      prevLabel: fmtCompactMajor(data.grossSalesMinor.previous, "NGN"),
    },
    {
      label: "Net Sales",
      value: fmtCompactMajor(data.netSalesMinor.current, "NGN"),
      delta: data.netSalesMinor,
      icon: <FiShoppingBag size={14} />,
      iconColor: "text-blue-500",
      prevLabel: fmtCompactMajor(data.netSalesMinor.previous, "NGN"),
    },
    {
      label: "Avg Order Value",
      value: fmtCompactMajor(data.aov.current, "NGN"),
      delta: data.aov,
      icon: <TbCurrencyNaira size={14} />,
      iconColor: "text-cyan-500",
      prevLabel: fmtCompactMajor(data.aov.previous, "NGN"),
    },
    {
      label: "Discounts",
      value: fmtCompactMajor(data.discountTotalMinor.current, "NGN"),
      delta: data.discountTotalMinor,
      icon: <FiTag size={14} />,
      iconColor: "text-amber-500",
      invertGood: true,
      prevLabel: fmtCompactMajor(data.discountTotalMinor.previous, "NGN"),
    },
    {
      label: "Refunded Orders",
      value: new Intl.NumberFormat().format(data.refundedOrdersCount.current),
      delta: data.refundedOrdersCount,
      icon: <FiAlertCircle size={14} />,
      iconColor: "text-rose-500",
      invertGood: true,
      prevLabel: new Intl.NumberFormat().format(
        data.refundedOrdersCount.previous,
      ),
    },
    {
      label: "Refund Rate",
      value: `${(data.refundRate.current * 100).toFixed(1)}%`,
      delta: data.refundRate,
      icon: <FiPercent size={14} />,
      iconColor: "text-pink-500",
      invertGood: true,
      prevLabel: `${(data.refundRate.previous * 100).toFixed(1)}%`,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
      {cards.map((c) => (
        <Card key={c.label} {...c} />
      ))}
    </div>
  );
}
