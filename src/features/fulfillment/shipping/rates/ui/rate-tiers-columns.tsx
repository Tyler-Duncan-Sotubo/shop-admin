"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/shared/ui/badge";
import { RowActions } from "@/shared/ui/row-actions";
import type { ShippingRateTier } from "../types/shipping-rate-tier.type";

function formatRange(min: number | null, max: number | null) {
  if (min == null || max == null) return "—";
  const toKg = (g: number) =>
    g >= 1000 ? `${(g / 1000).toFixed(g % 1000 === 0 ? 0 : 2)}kg` : `${g}g`;
  return `${toKg(min)} → ${toKg(max)}`;
}

export const rateTierColumns = ({
  onEdit,
}: {
  onEdit: (t: ShippingRateTier) => void;
}): ColumnDef<ShippingRateTier>[] => [
  {
    id: "range",
    header: "Weight range",
    cell: ({ row }) => (
      <div className="font-medium">
        {formatRange(row.original.minWeightGrams, row.original.maxWeightGrams)}
      </div>
    ),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => <Badge variant="outline">{row.original.amount}</Badge>,
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => <Badge variant="outline">{row.original.priority}</Badge>,
  },
  {
    id: "actions",
    header: () => <p className="text-right ml-auto pr-4">Actions</p>,
    cell: ({ row }) => (
      <RowActions
        row={row.original}
        onEdit={() => onEdit(row.original)}
        deleteEndpoint={`/api/shipping/rates/tiers/${row.original.id}`}
        refetchKey="shipping rate tiers"
      />
    ),
  },
];
