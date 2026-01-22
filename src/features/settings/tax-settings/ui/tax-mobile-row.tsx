// features/tax/ui/tax-mobile-row.tsx
"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import type { DataTableMobileRowProps } from "@/shared/ui/data-table";
import type { Tax } from "../types/tax.type";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { RowActions } from "@/shared/ui/row-actions";

function Rate({ rateBps }: { rateBps: number }) {
  return <span className="tabular-nums">{(rateBps / 100).toFixed(2)}%</span>;
}

export function TaxMobileRow({ row, table }: DataTableMobileRowProps<Tax>) {
  const t = row.original;

  // pass handlers via DataTable meta so mobile row can reuse your existing actions
  const meta = (table.options.meta ?? {}) as {
    onEdit?: (tax: Tax) => void;
    onSetDefault?: (tax: Tax) => void;
    refetchKey?: any;
  };

  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-medium truncate">{t.name ?? "—"}</div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant={t.isActive ? "default" : "secondary"}>
              {t.isActive ? "Active" : "Inactive"}
            </Badge>

            <Badge variant={t.isInclusive ? "outline" : "secondary"}>
              {t.isInclusive ? "Inclusive" : "Exclusive"}
            </Badge>

            {t.isDefault ? <Badge variant="outline">Default</Badge> : null}

            <span className="text-xs text-muted-foreground">
              Rate: <Rate rateBps={Number(t.rateBps ?? 0)} />
            </span>
          </div>

          {!t.isDefault ? (
            <div className="mt-3">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => meta.onSetDefault?.(t)}
              >
                Set default
              </Button>
            </div>
          ) : null}
        </div>

        <div
          className="shrink-0 flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <RowActions
            row={t as any}
            onEdit={() => meta.onEdit?.(t)}
            deleteEndpoint={`/api/taxes/${t.id}`}
            refetchKey={meta.refetchKey ?? ["billing", "taxes", "list", "all"]}
          />
        </div>
      </div>
    </div>
  );
}
