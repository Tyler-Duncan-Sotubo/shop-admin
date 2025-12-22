"use client";

import { DataTable } from "@/shared/ui/data-table";
import type { ShippingZone } from "../types/shipping-zone.type";
import { shippingZoneColumns } from "./shipping-zones-columns";

export function ShippingZonesTable({
  data,
  onEdit,
}: {
  data: ShippingZone[];
  onEdit: (z: ShippingZone) => void;
}) {
  return (
    <DataTable
      columns={shippingZoneColumns({ onEdit })}
      data={data}
      filterKey="name"
      filterPlaceholder="Search zones..."
    />
  );
}
