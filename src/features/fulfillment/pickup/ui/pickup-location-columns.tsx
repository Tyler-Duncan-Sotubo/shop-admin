// features/pickup/components/pickup-location-columns.tsx
"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/shared/ui/badge";
import { RowActions } from "@/shared/ui/row-actions";
import type { PickupLocation } from "../types/pickup-location.type";

export const pickupLocationColumns = ({
  onEdit,
}: {
  onEdit: (row: PickupLocation) => void;
}): ColumnDef<PickupLocation>[] => [
  { accessorKey: "name", header: "Name" },
  {
    accessorKey: "state",
    header: "State",
    cell: ({ row }) => row.original.state ?? "—",
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) =>
      row.original.isActive ? (
        <Badge>Active</Badge>
      ) : (
        <Badge variant="secondary">Inactive</Badge>
      ),
  },
  {
    accessorKey: "inventoryLocationId",
    header: "Inventory Origin",
    cell: ({ row }) => row.original.inventoryName ?? "—",
  },
  {
    id: "actions",
    header: () => <p className="text-right ml-auto pr-4">Actions</p>,
    cell: ({ row }) => (
      <RowActions
        row={row.original}
        onEdit={() => onEdit(row.original)}
        // use your backend: PATCH /:id/deactivate (RowActions might assume DELETE; if so, use a custom action button instead)
        deleteEndpoint={`/api/pickup-locations/${row.original.id}/deactivate`}
        refetchKey="pickup locations"
      />
    ),
  },
];
