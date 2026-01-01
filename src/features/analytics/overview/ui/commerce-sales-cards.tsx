/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { FiShoppingCart, FiUserPlus, FiUsers } from "react-icons/fi";
import { TbTargetArrow } from "react-icons/tb";
import { useCommerceCards } from "../hooks/use-commerce-overview";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { formatMoneyNGN } from "@/shared/utils/format-to-naira";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { usePersistedState } from "../../core/hooks/use-persisted-state";
import { Preset, usePresetRange } from "../../core/hooks/use-preset-range";

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

  iconBg: string; // kept for API compatibility (you weren't applying it yet)
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

export function CommerceSalesCards({
  session,
  activeStoreId,
  range: externalRange,
  hasRangeSelector = true,
}: {
  session: any;
  activeStoreId: string | null;
  range?: { from: string; to: string };
  hasRangeSelector?: boolean;
}) {
  const [preset, setPreset] = usePersistedState<Preset>(
    "analytics:preset",
    "today"
  );

  const presetRange = usePresetRange(preset);

  // ✅ If parent passes a range, use it. Otherwise use preset range.
  const range = externalRange ?? presetRange;

  const cards = useCommerceCards({ ...range, storeId: activeStoreId }, session);
  const d = cards.data;

  return (
    <div className="space-y-4">
      {hasRangeSelector && !externalRange ? (
        <div className="flex items-center justify-end gap-3">
          <Select value={preset} onValueChange={(v) => setPreset(v as Preset)}>
            <SelectTrigger className="h-8 w-[150px]">
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Total sales"
          value={
            cards.isLoading ? "" : formatMoneyNGN(d?.totalSalesMinor, "NGN")
          }
          icon={<TbTargetArrow size={18} />}
          iconBg="bg-indigo-600"
          cardBg="bg-indigo-50"
          deltaPct={d?.deltas?.totalSalesMinor?.changePct ?? null}
        />

        <Stat
          label="Total orders"
          value={cards.isLoading ? "" : fmtInt(d?.totalOrders ?? 0)}
          icon={<FiShoppingCart size={18} />}
          iconBg="bg-violet-600"
          cardBg="bg-violet-50"
          deltaPct={d?.deltas?.totalOrders?.changePct ?? null}
        />

        <Stat
          label="New customers"
          value={cards.isLoading ? "" : fmtInt(d?.newCustomers ?? 0)}
          icon={<FiUserPlus size={18} />}
          iconBg="bg-purple-600"
          cardBg="bg-purple-50"
          deltaPct={d?.deltas?.newCustomers?.changePct ?? null}
        />

        <Stat
          label="Web visits"
          value={cards.isLoading ? "" : fmtInt(d?.webVisits ?? 0)}
          icon={<FiUsers size={18} />}
          iconBg="bg-indigo-500"
          cardBg="bg-indigo-100"
          deltaPct={d?.deltas?.webVisits?.changePct ?? null}
        />
      </div>
    </div>
  );
}
