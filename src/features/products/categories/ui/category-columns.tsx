"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Category } from "../types/category.type";
import { SortableHeader } from "@/shared/ui/sortable-header";
import { Badge } from "@/shared/ui/badge";
import { RowActions } from "@/shared/ui/row-actions";
import Image from "next/image";

type Props = {
  onEdit: (row: Category) => void;
  getParentName?: (parentId: string | null) => string;
};

export function categoryColumns({
  onEdit,
  getParentName,
}: Props): ColumnDef<Category>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => <SortableHeader column={column} title="Name" />,
      cell: ({ row }) => {
        const cat = row.original;
        const url = row.original.imageUrl;
        const parentLabel =
          cat.parentId && getParentName ? getParentName(cat.parentId) : null;

        return (
          <div className="flex gap-2 items-center">
            <div className="relative h-10 w-10 overflow-hidden rounded-md border bg-muted">
              {url ? (
                <Image
                  src={url}
                  alt={row.original.name}
                  fill
                  className="object-cover"
                />
              ) : null}
            </div>
            <div>
              <div className="font-medium">{cat.name}</div>
              <div className="text-xs text-muted-foreground">
                {parentLabel ? `Parent: ${parentLabel}` : "No parent"}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "productCount",
      header: ({ column }) => (
        <SortableHeader column={column} title="Products" />
      ),
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.getValue("productCount")}</div>
      ),
    },
    {
      accessorKey: "isActive",
      header: ({ column }) => <SortableHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const active = row.original.isActive;
        return active ? (
          <Badge>Active</Badge>
        ) : (
          <Badge variant="outline">Inactive</Badge>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <RowActions
          row={row.original}
          onEdit={onEdit}
          deleteEndpoint={`/api/catalog/categories/${row.original.id}`}
          refetchKey="categories"
        />
      ),
    },
  ];
}
