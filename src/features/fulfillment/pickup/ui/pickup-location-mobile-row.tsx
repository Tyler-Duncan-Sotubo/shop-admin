// features/pickup/components/pickup-location-mobile-row.tsx
"use client";

import * as React from "react";
import type { DataTableMobileRowProps } from "@/shared/ui/data-table";
import { Badge } from "@/shared/ui/badge";
import { RowActions } from "@/shared/ui/row-actions";
import type { PickupLocation } from "../types/pickup-location.type";

export function PickupLocationMobileRow({
  row,
  table,
  onRowClick,
}: DataTableMobileRowProps<PickupLocation>) {
  const p = row.original;

  const meta = (table.options.meta ?? {}) as {
    onEdit?: (row: PickupLocation) => void;
  };

  return (
    <div
      className={[
        "px-4 py-4",
        onRowClick ? "cursor-pointer active:bg-muted/40" : "",
      ].join(" ")}
      onClick={() => onRowClick?.(p)}
    >
      <div className="flex items-start gap-3">
        {/* Main */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">{p.name}</div>

              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                {p.isActive ? (
                  <Badge className="h-5 px-2 text-[10px]">Active</Badge>
                ) : (
                  <Badge variant="outline" className="h-5 px-2 text-[10px]">
                    Inactive
                  </Badge>
                )}
                {p.state ? (
                  <>
                    <span className="text-muted-foreground/60">•</span>
                    <span className="truncate">{p.state}</span>
                  </>
                ) : null}
              </div>
            </div>

            {/* Actions */}
            <div
              className="shrink-0"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <RowActions
                row={p}
                onEdit={() => meta.onEdit?.(p)}
                deleteEndpoint={`/api/pickup-locations/${p.id}/deactivate`}
                refetchKey="pickup locations"
              />
            </div>
          </div>

          {/* Meta row */}
          <div className="mt-3 flex items-center justify-between gap-3 text-xs">
            <span className="text-muted-foreground">Inventory origin</span>
            <span className="font-medium text-foreground truncate max-w-[60%]">
              {p.inventoryName ?? "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
