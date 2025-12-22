"use client";

import { DataTable } from "@/shared/ui/data-table";
import { storeLocationColumns } from "./store-location-columns";
import { StoreLocation } from "../types/store-locations.type";

export function StoreLocationsTable({ data }: { data: StoreLocation[] }) {
  return (
    <DataTable
      columns={storeLocationColumns}
      data={data}
      filterKey="name"
      filterPlaceholder="Search locations..."
    />
  );
}
