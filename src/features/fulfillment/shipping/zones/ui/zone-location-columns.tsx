"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/shared/ui/badge";
import { RowActions } from "@/shared/ui/row-actions";
import { ShippingZoneLocation } from "../types/shipping-zone-location.type";

export const zoneLocationColumns = ({
  onEdit,
}: {
  onEdit: (loc: ShippingZoneLocation) => void;
}): ColumnDef<ShippingZoneLocation>[] => [
  {
    accessorKey: "countryCode",
    header: "Country",
    cell: () => <Badge>Nigeria</Badge>,
  },
  {
    accessorKey: "regionCode",
    header: "State",
    cell: ({ row }) =>
      row.original.regionCode
        ? row.original.regionCode.replace(/_/g, " ")
        : "All states",
  },
  {
    accessorKey: "area",
    header: "Area",
    cell: ({ row }) => row.original.area ?? "All areas",
  },
  {
    id: "actions",
    header: () => <p className="text-right ml-auto pr-4">Actions</p>,
    cell: ({ row }) => (
      <RowActions
        row={row.original}
        onEdit={() => onEdit(row.original)}
        deleteEndpoint={`/api/shipping/zones/locations/${row.original.id}`}
        refetchKey="shipping zones"
      />
    ),
  },
];
