"use client";

import { DataTable } from "@/shared/ui/data-table";
import type { ShippingRate } from "../types/shipping-rate.type";
import { shippingRateColumns } from "./shipping-rates-columns";

export function ShippingRatesTable({
  data,
  onEdit,
}: {
  data: ShippingRate[];
  onEdit: (r: ShippingRate) => void;
}) {
  return (
    <DataTable
      columns={shippingRateColumns({ onEdit })}
      data={data}
      filterKey="name"
      filterPlaceholder="Search rates..."
    />
  );
}
