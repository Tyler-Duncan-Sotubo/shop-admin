"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ChevronDown, ChevronRight } from "lucide-react";
import { InventoryAdjustAction } from "./inventory-adjust-action";
import { cn } from "@/lib/utils";
import type { InventoryOverviewRow } from "../types/inventory.type";

export type InventoryGroupRow = {
  productName: string;
  inStock: number;
  committed: number;
  onHand: number;
  lowStock: boolean;
  children: InventoryOverviewRow[];
};

type RowType = InventoryGroupRow | InventoryOverviewRow;

function isGroupRow(r: RowType): r is InventoryGroupRow {
  return (r as InventoryGroupRow).children !== undefined;
}

export const inventoryColumns = (
  locationId: string,
  expanded: Record<string, boolean>,
  toggleExpanded: (productName: string) => void
): ColumnDef<RowType>[] => [
  {
    accessorKey: "productName",
    header: "Product",
    cell: ({ row }) => {
      const r = row.original;

      // Group row
      if (isGroupRow(r)) {
        const open = !!expanded[r.productName];
        return (
          <button
            type="button"
            onClick={() => toggleExpanded(r.productName)}
            className="flex items-center gap-2 text-left"
          >
            {open ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            <div className="font-medium">{r.productName}</div>
            <span className="text-xs text-muted-foreground">
              ({r.children.length} variants)
            </span>
          </button>
        );
      }

      // Variant row (indent)
      return (
        <div className="pl-6 space-y-0.5">
          <div className="text-sm">{r.variantTitle ?? "Default"}</div>
          <div className="text-xs text-muted-foreground">
            {r.sku ? `SKU: ${r.sku}` : ""}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "inStock",
    header: "In Stock",
    cell: ({ row }) => <span>{row.original.inStock}</span>,
  },
  {
    accessorKey: "committed",
    header: "Committed",
    cell: ({ row }) => <span>{row.original.committed}</span>,
  },
  {
    accessorKey: "onHand",
    header: "On hand",
    cell: ({ row }) => <span>{row.original.onHand}</span>,
  },
  {
    accessorKey: "lowStock",
    header: "Status",
    cell: ({ row }) => {
      const r = row.original;
      return (
        <span
          className={cn(
            r.lowStock ? "text-amber-600" : "text-muted-foreground"
          )}
        >
          {r.lowStock ? "Low stock" : "OK"}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const r = row.original;
      // Only allow adjust action on variant rows (not group row)
      if (isGroupRow(r)) return null;

      return (
        <div className="flex justify-end">
          <InventoryAdjustAction row={r} locationId={locationId} />
        </div>
      );
    },
  },
];
