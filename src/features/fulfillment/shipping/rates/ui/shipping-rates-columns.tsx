"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/shared/ui/badge";
import { RowActions } from "@/shared/ui/row-actions";
import type { ShippingRate } from "../types/shipping-rate.type";
import Link from "next/link";
import { MdOutlineLayers } from "react-icons/md";

export const shippingRateColumns = ({
  onEdit,
}: {
  onEdit: (r: ShippingRate) => void;
}): ColumnDef<ShippingRate>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
  },
  {
    accessorKey: "calc",
    header: "Calc",
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {row.original.calc}
      </Badge>
    ),
  },
  {
    accessorKey: "flatAmount",
    header: "Amount",
    cell: ({ row }) =>
      row.original.calc === "flat" ? row.original.flatAmount ?? "—" : "Tiered",
  },
  {
    accessorKey: "isDefault",
    header: "Default",
    cell: ({ row }) => (
      <Badge variant={row.original.isDefault ? "default" : "secondary"}>
        {row.original.isDefault ? "Yes" : "No"}
      </Badge>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.isActive ? "default" : "secondary"}>
        {row.original.isActive ? "Active" : "Inactive"}
      </Badge>
    ),
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
        deleteEndpoint={`/api/shipping/rates/${row.original.id}`}
        refetchKey="shipping rates"
      />
    ),
  },
  {
    id: "tiers",
    header: "Tiers",
    cell: ({ row }) => {
      const rate = row.original;

      if (rate.calc !== "weight") {
        return <span className="text-muted-foreground">—</span>;
      }

      return (
        <Link
          href={`/shipping/rates/${rate.id}`}
          className="inline-flex items-center gap-1 text-blue-600 hover:underline"
        >
          <MdOutlineLayers size={16} />
          <span>Manage tiers</span>
        </Link>
      );
    },
  },
];
