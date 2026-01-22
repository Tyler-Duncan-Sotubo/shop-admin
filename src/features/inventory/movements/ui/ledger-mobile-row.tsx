// features/inventory/ledger/ui/ledger-mobile-row.tsx
"use client";

import * as React from "react";
import type { DataTableMobileRowProps } from "@/shared/ui/data-table";
import { Badge } from "@/shared/ui/badge";
import type { InventoryLedgerRow } from "../types/ledger.type";

function TypeBadge({ type }: { type: string }) {
  if (type === "fulfill" || type === "pos_deduct")
    return <Badge>Deducted</Badge>;
  if (type === "reserve") return <Badge variant="secondary">Reserved</Badge>;
  if (type === "release") return <Badge variant="secondary">Released</Badge>;
  return <Badge variant="secondary">{type}</Badge>;
}

function Delta({ n }: { n: number }) {
  const isNeg = Number(n) < 0;
  return (
    <span className={isNeg ? "text-red-600" : "text-green-600"}>
      {n > 0 ? `+${n}` : `${n}`}
    </span>
  );
}

export function LedgerMobileRow({
  row,
  onRowClick,
}: DataTableMobileRowProps<InventoryLedgerRow>) {
  const r = row.original;

  const time = r.createdAt ? new Date(r.createdAt).toLocaleString() : "—";

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
          <div className="font-medium truncate">
            {r.variantName ?? "Unknown variant"}
          </div>
          <div className="mt-1 text-xs text-muted-foreground truncate">
            {r.locationName ?? "Unknown location"}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">{time}</div>
        </div>

        <div className="shrink-0 flex flex-col items-end gap-2">
          <TypeBadge type={r.type} />
          <div className="text-xs text-muted-foreground">
            Available / Reserved
          </div>
          <div className="text-sm font-medium tabular-nums">
            <Delta n={Number(r.deltaAvailable ?? 0)} />{" "}
            <span className="text-muted-foreground">/</span>{" "}
            <Delta n={Number(r.deltaReserved ?? 0)} />
          </div>
        </div>
      </div>

      {r.note ? (
        <div className="mt-3 text-sm text-muted-foreground line-clamp-2">
          {r.note}
        </div>
      ) : null}
    </div>
  );
}
