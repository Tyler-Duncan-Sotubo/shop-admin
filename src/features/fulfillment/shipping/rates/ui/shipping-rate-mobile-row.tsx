// features/shipping/rates/ui/shipping-rate-mobile-row.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import type { DataTableMobileRowProps } from "@/shared/ui/data-table";
import { Badge } from "@/shared/ui/badge";
import { RowActions } from "@/shared/ui/row-actions";
import type { ShippingRate } from "../types/shipping-rate.type";
import { MdOutlineLayers } from "react-icons/md";

export function ShippingRateMobileRow({
  row,
  table,
  onRowClick,
}: DataTableMobileRowProps<ShippingRate>) {
  const r = row.original;

  const meta = (table.options.meta ?? {}) as {
    onEdit?: (rate: ShippingRate) => void;
  };

  const amount =
    r.calc === "flat"
      ? (r.flatAmount ?? "—")
      : r.calc === "weight"
        ? "Tiered"
        : "Tiered";

  return (
    <div
      className={[
        "p-4",
        onRowClick ? "cursor-pointer active:bg-muted/40" : "",
      ].join(" ")}
      onClick={() => onRowClick?.(r)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-medium truncate">{r.name}</div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {r.calc}
            </Badge>

            <Badge variant={r.isDefault ? "default" : "secondary"}>
              {r.isDefault ? "Default" : "Not default"}
            </Badge>

            <Badge variant={r.isActive ? "default" : "secondary"}>
              {r.isActive ? "Active" : "Inactive"}
            </Badge>

            <Badge variant="outline">Priority {r.priority}</Badge>
          </div>
        </div>

        {/* Actions on right */}
        <div
          className="shrink-0"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <RowActions
            row={r}
            onEdit={() => meta.onEdit?.(r)}
            deleteEndpoint={`/api/shipping/rates/${r.id}`}
            refetchKey="shipping rates"
          />
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">Amount</span>
          <span className="text-sm font-medium">{amount}</span>
        </div>

        {r.calc === "weight" ? (
          <div className="pt-1">
            <Link
              href={`/shipping/rates/${r.id}?tab=rates`}
              className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <MdOutlineLayers size={16} />
              <span>Manage tiers</span>
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
