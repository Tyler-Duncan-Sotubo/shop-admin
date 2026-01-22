// features/inventory/ui/inventory-mobile-row.tsx
"use client";

import * as React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { DataTableMobileRowProps } from "@/shared/ui/data-table";
import { cn } from "@/lib/utils";
import type { InventoryOverviewRow } from "../types/inventory.type";
import type { InventoryGroupRow } from "./inventory-columns";
import { InventoryAdjustAction } from "./inventory-adjust-action";

type RowType = InventoryGroupRow | InventoryOverviewRow;

function isGroupRow(r: RowType): r is InventoryGroupRow {
  return (r as InventoryGroupRow).children !== undefined;
}

export function InventoryMobileRow({
  row,
  table,
}: DataTableMobileRowProps<RowType>) {
  const r = row.original;

  const meta = (table.options.meta ?? {}) as {
    locationId: string;
    expanded: Record<string, boolean>;
    toggleExpanded: (productName: string) => void;
  };

  // Variant row
  if (!isGroupRow(r)) {
    return (
      <div className="px-4 py-3 bg-muted/20">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-medium">
              {r.variantTitle ?? "Default"}
            </div>
            {r.sku ? (
              <div className="mt-1 text-xs text-muted-foreground truncate">
                SKU: {r.sku}
              </div>
            ) : null}

            <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
              <div className="flex flex-col">
                <span className="text-muted-foreground">In stock</span>
                <span className="font-medium tabular-nums">{r.inStock}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground">Committed</span>
                <span className="font-medium tabular-nums">{r.committed}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground">On hand</span>
                <span className="font-medium tabular-nums">{r.onHand}</span>
              </div>
            </div>

            <div
              className={cn(
                "mt-2 text-xs",
                r.lowStock ? "text-amber-600" : "text-muted-foreground",
              )}
            >
              {r.lowStock ? "Low stock" : ""}
            </div>
          </div>

          <div
            className="shrink-0"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <InventoryAdjustAction row={r} locationId={meta.locationId} />
          </div>
        </div>
      </div>
    );
  }

  // Group row
  const open = !!meta.expanded[r.productName];

  return (
    <div className="p-4">
      <button
        type="button"
        className="w-full text-left"
        onClick={() => meta.toggleExpanded(r.productName)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {open ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
              <div className="font-semibold truncate text-sm ">
                {r.productName}
              </div>
            </div>

            <div className="mt-1 text-xs text-muted-foreground">
              {r.children.length} variant(s)
            </div>
          </div>

          <div
            className={cn(
              "text-xs",
              r.lowStock ? "text-amber-600" : "text-muted-foreground",
            )}
          >
            {r.lowStock ? "Low stock" : ""}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-xs w-[60%]">
          <div className="flex flex-col">
            <span className="text-muted-foreground">In stock</span>
            <span className="font-medium tabular-nums">{r.inStock}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">Committed</span>
            <span className="font-medium tabular-nums">{r.committed}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">On hand</span>
            <span className="font-medium tabular-nums">{r.onHand}</span>
          </div>
        </div>
      </button>
    </div>
  );
}
