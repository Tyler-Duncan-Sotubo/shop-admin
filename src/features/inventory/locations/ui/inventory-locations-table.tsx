"use client";

import { DataTable } from "@/shared/ui/data-table";
import { InventoryLocation } from "../types/inventory-location.type";
import { inventoryLocationColumns } from "./inventory-location-columns";

export function InventoryLocationsTable({
  data,
  onEdit,
}: {
  data: InventoryLocation[];
  onEdit: (loc: InventoryLocation) => void;
}) {
  return (
    <DataTable
      columns={inventoryLocationColumns(onEdit)}
      data={data}
      filterKey="name"
      filterPlaceholder="Search locations..."
    />
  );
}
