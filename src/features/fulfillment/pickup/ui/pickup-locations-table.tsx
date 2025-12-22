// features/pickup/components/pickup-locations-table.tsx
"use client";

import { DataTable } from "@/shared/ui/data-table";
import type { PickupLocation } from "../types/pickup-location.type";
import { pickupLocationColumns } from "./pickup-location-columns";

export function PickupLocationsTable({
  data,
  onEdit,
}: {
  data: PickupLocation[];
  onEdit: (row: PickupLocation) => void;
}) {
  return (
    <DataTable
      columns={pickupLocationColumns({ onEdit })}
      data={data}
      filterKey="name"
      filterPlaceholder="Filter pickup locations..."
    />
  );
}
