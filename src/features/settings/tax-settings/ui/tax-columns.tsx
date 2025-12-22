"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/shared/ui/badge";
import { RowActions } from "@/shared/ui/row-actions";
import { Button } from "@/shared/ui/button";
import type { Tax } from "../types/tax.type";

export const taxColumns = ({
  onEdit,
  onSetDefault,
}: {
  onEdit: (row: Tax) => void;
  onSetDefault: (row: Tax) => void;
}): ColumnDef<Tax>[] => [
  { accessorKey: "name", header: "Name" },
  {
    accessorKey: "rateBps",
    header: "Rate",
    cell: ({ row }) => `${(row.original.rateBps / 100).toFixed(2)}%`,
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
    id: "default",
    header: "Default",
    cell: ({ row }) =>
      row.original.isDefault ? (
        <Badge variant="outline">Default</Badge>
      ) : (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onSetDefault(row.original)}
        >
          Set default
        </Button>
      ),
  },
  {
    id: "type",
    header: "Type",
    cell: ({ row }) => (
      <div className="flex gap-2">
        {row.original.isInclusive ? (
          <Badge variant="outline">Inclusive</Badge>
        ) : (
          <Badge variant="secondary">Exclusive</Badge>
        )}
        {row.original.isDefault ? <Badge>Default</Badge> : null}
      </div>
    ),
  },

  {
    id: "actions",
    header: () => <p className="text-right ml-auto pr-4">Actions</p>,
    cell: ({ row }) => (
      <RowActions
        row={row.original}
        onEdit={() => onEdit(row.original)}
        deleteEndpoint={`/api/taxes/${row.original.id}`} // DELETE deactivate
        refetchKey={["billing", "taxes", "list", "all"]}
      />
    ),
  },
];
