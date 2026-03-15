"use client";

import { ColumnDef } from "@tanstack/react-table";
import { SortableHeader } from "@/shared/ui/sortable-header";
import { Badge } from "@/shared/ui/badge";
import { InventoryLocation } from "../types/inventory-location.type";
import { RowActions } from "@/shared/ui/row-actions";

export const inventoryLocationColumns = (
  onEdit: (loc: InventoryLocation) => void
): ColumnDef<InventoryLocation>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => <SortableHeader column={column} title="Name" />,
    cell: ({ row }) => {
      const loc = row.original;
      return (
        <div>
          <div className="font-medium">{loc.name}</div>
          <div className="text-xs text-muted-foreground">
            {loc.code ? loc.code : "No code"}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: ({ column }) => <SortableHeader column={column} title="Type" />,
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {row.getValue("type")}
      </Badge>
    ),
  },
  {
    accessorKey: "isActive",
    header: ({ column }) => <SortableHeader column={column} title="Status" />,
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
    header: () => <div>Actions</div>,
    cell: ({ row }) => (
      <div className="flex items-center w-full gap-4">
        <RowActions
          row={row.original}
          onEdit={onEdit}
          deleteEndpoint={`/api/inventory/locations/${row.original.id}`}
          refetchKey="inventory-locations"
        />
      </div>
    ),
  },
];
