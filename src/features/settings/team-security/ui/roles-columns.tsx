"use client";

import { ColumnDef } from "@tanstack/react-table";
import { SortableHeader } from "@/shared/ui/sortable-header";
import { RoleRow } from "../types/user.type";

export const rolesColumns: ColumnDef<RoleRow>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: ({ column }) => <SortableHeader column={column} title="Role" />,
    cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
  },
  {
    id: "description",
    accessorKey: "description",
    header: ({ column }) => (
      <SortableHeader column={column} title="Description" />
    ),
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {row.original.description}
      </div>
    ),
  },
];
