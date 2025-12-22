"use client";

import { DataTable } from "@/shared/ui/data-table";
import { ShippingZoneLocation } from "../types/shipping-zone-location.type";
import { zoneLocationColumns } from "./zone-location-columns";

export function ZoneLocationsTable({
  data,
  onEdit,
}: {
  data: ShippingZoneLocation[];
  onEdit: (loc: ShippingZoneLocation) => void;
}) {
  return (
    <DataTable
      columns={zoneLocationColumns({ onEdit })}
      data={data}
      filterKey="regionCode"
      filterPlaceholder="Filter locations..."
    />
  );
}
