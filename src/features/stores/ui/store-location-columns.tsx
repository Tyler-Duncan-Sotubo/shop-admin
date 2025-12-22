"use client";

import { ColumnDef } from "@tanstack/react-table";
import { SortableHeader } from "@/shared/ui/sortable-header";
import { Badge } from "@/shared/ui/badge";
import { InventoryLocation } from "../types/store-locations.type";

export const storeLocationColumns: ColumnDef<InventoryLocation>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: ({ column }) => <SortableHeader column={column} title="Location" />,
    cell: ({ row }) => {
      const loc = row.original;
      return (
        <div>
          <div className="font-medium">{loc.name ?? "—"}</div>
          <div className="text-xs text-muted-foreground">
            {loc.code ? loc.code : "No code"}
          </div>
        </div>
      );
    },
  },
  {
    id: "type",
    accessorKey: "type",
    header: ({ column }) => <SortableHeader column={column} title="Type" />,
    cell: ({ row }) => {
      const type = row.original.type;
      return (
        <Badge variant="outline" className="capitalize">
          {type ?? "—"}
        </Badge>
      );
    },
  },
  {
    id: "status",
    accessorFn: (row) => (row.isActive ? "active" : "inactive"),
    header: ({ column }) => <SortableHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const active = row.original.isActive;
      return (
        <Badge variant={active ? "default" : "secondary"}>
          {active ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    id: "primary",
    accessorKey: "isPrimary",
    header: ({ column }) => <SortableHeader column={column} title="Primary" />,
    cell: ({ row }) => {
      const isPrimary = row.original.isPrimary;
      return isPrimary ? (
        <Badge>Primary</Badge>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    },
  },
  {
    id: "locationStatus",
    accessorFn: (row) => (row.isActive ? "active" : "inactive"),
    header: ({ column }) => (
      <SortableHeader column={column} title="Location Status" />
    ),
    cell: ({ row }) => {
      const active = row.original.isActive;
      return (
        <Badge variant={active ? "default" : "secondary"}>
          {active ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
];
