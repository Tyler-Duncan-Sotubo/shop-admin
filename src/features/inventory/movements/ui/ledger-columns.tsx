"use client";

import type { ColumnDef } from "@tanstack/react-table";
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

export const ledgerColumns = (): ColumnDef<InventoryLedgerRow>[] => [
  {
    accessorKey: "createdAt",
    header: "Time",
    cell: ({ row }) =>
      row.original.createdAt
        ? new Date(row.original.createdAt).toLocaleString()
        : "—",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => <TypeBadge type={row.original.type} />,
  },
  {
    id: "location",
    header: "Location",
    cell: ({ row }) => {
      const r = row.original;
      return (
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">
            {r.locationName ?? "Unknown location"}
          </div>
        </div>
      );
    },
  },
  {
    id: "variant",
    header: "Variant",
    cell: ({ row }) => {
      const r = row.original;
      return (
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">
            {r.variantName ?? "Unknown variant"}
          </div>
        </div>
      );
    },
  },
  {
    id: "deltaAvailable",
    header: "Available",
    cell: ({ row }) => <Delta n={Number(row.original.deltaAvailable ?? 0)} />,
  },
  {
    id: "deltaReserved",
    header: "Reserved",
    cell: ({ row }) => <Delta n={Number(row.original.deltaReserved ?? 0)} />,
  },
  {
    accessorKey: "note",
    header: "Note",
    cell: ({ row }) => row.original.note ?? "—",
  },
];
