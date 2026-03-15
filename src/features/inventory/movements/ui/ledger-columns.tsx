"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/shared/ui/badge";
import type { InventoryLedgerRow } from "../types/ledger.type";

function TypeBadge({ type }: { type: string }) {
  if (type === "fulfill" || type === "pos_deduct")
    return <Badge variant="destructive">Deducted</Badge>;
  if (type === "reserve") return <Badge variant="secondary">Reserved</Badge>;
  if (type === "release") return <Badge variant="outline">Released</Badge>;
  if (type === "transfer_out")
    return <Badge variant="outline">Transfer Out</Badge>;
  if (type === "transfer_in")
    return (
      <Badge className="bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-100">
        Transfer In
      </Badge>
    );
  if (type === "adjustment")
    return (
      <Badge className="bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-100">
        Adjustment
      </Badge>
    );
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
    header: "Available Δ",
    cell: ({ row }) => {
      const n = Number(row.original.deltaAvailable ?? 0);
      if (n === 0) return <span className="text-muted-foreground">—</span>;
      return <Delta n={n} />;
    },
  },
  {
    id: "deltaReserved",
    header: "Reserved Δ",
    cell: ({ row }) => {
      const n = Number(row.original.deltaReserved ?? 0);
      if (n === 0) return <span className="text-muted-foreground">—</span>;
      return <Delta n={n} />;
    },
  },
  {
    accessorKey: "note",
    header: "Note",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.note ?? "—"}
      </span>
    ),
  },
];
