"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/shared/ui/badge";
import { RowActions } from "@/shared/ui/row-actions";
import { Button } from "@/shared/ui/button";
import type { ShippingZone } from "../types/shipping-zone.type";

export function shippingZoneColumns({
  onEdit,
}: {
  onEdit: (z: ShippingZone) => void;
}): ColumnDef<ShippingZone>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const z = row.original;
        return (
          <Link
            href={`/shipping/zones/${z.id}`}
            className="font-medium hover:underline"
          >
            {z.name}
          </Link>
        );
      },
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("priority")}</Badge>
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
      id: "View Locations",
      header: "Locations",
      cell: ({ row }) => {
        const z = row.original;
        return (
          <Link href={`/shipping/zones/${z.id}`}>
            <Button variant="link" className="p-0">
              View Locations
            </Button>
          </Link>
        );
      },
    },
    {
      id: "actions",
      header: () => <p className="text-right ml-auto pr-4">Actions</p>,
      cell: ({ row }) => (
        <RowActions
          row={row.original}
          deleteEndpoint={`/api/shipping/zones/${row.original.id}`}
          onEdit={() => onEdit(row.original)}
          refetchKey="shipping zones"
        />
      ),
    },
  ];
}
