"use client";

import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, Package } from "lucide-react";
import { Badge } from "@/shared/ui/badge";

type StockItem = {
  itemId: string;
  name: string;
  requested: number;
  sellable: number;
  shortfall: number;
  sufficient: boolean;
};

type Props = {
  insufficientItems: StockItem[];
  fulfillmentModel?: "stock_first" | "payment_first";
};

export function StockWarning({ insufficientItems, fulfillmentModel }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (!insufficientItems.length) return null;

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 overflow-hidden text-sm">
      {/* header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-amber-100/60 dark:hover:bg-amber-900/20 transition-colors"
      >
        <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
        <span className="flex-1 text-xs font-medium text-amber-800 dark:text-amber-300 leading-snug">
          {insufficientItems.length} item
          {insufficientItems.length > 1 ? "s" : ""} low on stock
        </span>
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5 text-amber-500 shrink-0" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-amber-500 shrink-0" />
        )}
      </button>

      {/* expanded rows */}
      {expanded && (
        <div className="border-t border-amber-200 dark:border-amber-900">
          {insufficientItems.map((item) => (
            <div
              key={item.itemId}
              className="flex items-start gap-2 px-3 py-2 border-b border-amber-100 dark:border-amber-900 last:border-0"
            >
              <Package className="h-3 w-3 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0 space-y-0.5">
                <p className="text-xs font-medium text-amber-900 dark:text-amber-200 truncate">
                  {item.name}
                </p>
                <p className="text-[10px] text-amber-600 dark:text-amber-400">
                  Need {item.requested} · Have {item.sellable}
                </p>
              </div>
              <Badge className="shrink-0 text-[10px] px-1.5 py-0 h-4 bg-red-100 text-red-700 border-red-200 font-medium">
                -{item.shortfall}
              </Badge>
            </div>
          ))}

          {/* footer note */}
          <div className="px-3 py-2 bg-amber-50/80 dark:bg-amber-950/20">
            <p className="text-[10px] text-amber-700 dark:text-amber-400 leading-relaxed">
              {fulfillmentModel === "payment_first" ? (
                <>
                  <span className="font-medium">Payment first</span> — stock
                  checked at fulfillment.
                </>
              ) : (
                <>
                  <span className="font-medium">Stock first</span> — restock
                  before submitting.
                </>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
