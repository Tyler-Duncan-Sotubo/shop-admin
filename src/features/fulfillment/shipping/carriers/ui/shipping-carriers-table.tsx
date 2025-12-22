"use client";

import { DataTable } from "@/shared/ui/data-table";
import { ShippingCarrier } from "../types/shipping-carrier.type";
import { shippingCarrierColumns } from "./shipping-carrier-columns";

export function ShippingCarriersTable({
  data,
  onEdit,
}: {
  data: ShippingCarrier[];
  onEdit: (c: ShippingCarrier) => void;
}) {
  return (
    <DataTable
      columns={shippingCarrierColumns(onEdit)}
      data={data}
      filterKey="name"
      filterPlaceholder="Search carriers..."
    />
  );
}
