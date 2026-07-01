"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { FaPen, FaTrash } from "react-icons/fa6";
import { cn } from "@/lib/utils";
import type { ShippingOption } from "../hooks/use-shipping-options";

export const shippingOptionColumns = ({
  onEdit,
  onDelete,
  onToggle,
}: {
  onEdit: (row: ShippingOption) => void;
  onDelete: (row: ShippingOption) => void;
  onToggle: (row: ShippingOption) => void;
}): ColumnDef<ShippingOption>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    id: "coverage",
    header: "Coverage",
    cell: ({ row }) => {
      const opt = row.original;
      if (opt.states.length === 0) return <span className="text-muted-foreground">All states</span>;
      if (opt.area) return <span className="text-muted-foreground">{opt.states[0]} · {opt.area}</span>;
      const label =
        opt.states.length <= 4
          ? opt.states.join(", ")
          : `${opt.states.slice(0, 4).join(", ")} +${opt.states.length - 4} more`;
      return <span className="text-muted-foreground">{label}</span>;
    },
  },
  {
    accessorKey: "price",
    header: "Fee",
    cell: ({ row }) =>
      `₦${row.original.price.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`,
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <button
        type="button"
        onClick={() => onToggle(row.original)}
        className="focus:outline-none"
        title={row.original.isActive ? "Click to deactivate" : "Click to activate"}
      >
        <Badge
          variant={row.original.isActive ? "default" : "secondary"}
          className={cn(
            "cursor-pointer",
            row.original.isActive && "bg-green-100 text-green-800 hover:bg-green-200",
          )}
        >
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
      </button>
    ),
  },
  {
    id: "actions",
    header: () => <p className="text-right ml-auto pr-1">Actions</p>,
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onEdit(row.original)}
        >
          <FaPen className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={() => onDelete(row.original)}
        >
          <FaTrash className="h-3.5 w-3.5" />
        </Button>
      </div>
    ),
  },
];
