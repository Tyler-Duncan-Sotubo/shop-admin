"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/shared/ui/badge";
import { RowActions } from "@/shared/ui/row-actions";
import { ShippingCarrier } from "../types/shipping-carrier.type";

export const shippingCarrierColumns = (
  onEdit: (c: ShippingCarrier) => void
): ColumnDef<ShippingCarrier>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
  },
  {
    accessorKey: "providerKey",
    header: "Provider key",
    cell: ({ row }) => (
      <code className="text-xs bg-muted px-2 py-1 rounded">
        {row.original.providerKey}
      </code>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const active = row.getValue<boolean>("isActive");
      return (
        <Badge variant={active ? "default" : "secondary"}>
          {active ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right pr-4">Actions</div>,
    cell: ({ row }) => (
      <RowActions
        row={row.original}
        onEdit={onEdit}
        deleteEndpoint={`/api/shipping/carriers/${row.original.id}`}
        refetchKey="shipping carriers"
      />
    ),
  },
];
