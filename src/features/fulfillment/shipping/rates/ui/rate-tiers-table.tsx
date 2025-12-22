"use client";

import { DataTable } from "@/shared/ui/data-table";
import type { ShippingRateTier } from "../types/shipping-rate-tier.type";
import { rateTierColumns } from "./rate-tiers-columns";

export function RateTiersTable({
  data,
  onEdit,
}: {
  data: ShippingRateTier[];
  onEdit: (t: ShippingRateTier) => void;
}) {
  return (
    <DataTable
      columns={rateTierColumns({ onEdit })}
      data={data}
      filterKey="amount"
      filterPlaceholder="Search tiers..."
    />
  );
}
