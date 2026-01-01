"use client";

import { DataTable } from "@/shared/ui/data-table";
import { topProductsColumns } from "./top-products-columns";
import { CommerceTopProductRow } from "../../overview/types/commerce-analytics.type";

export function TopProductsDataTable({
  data,
  toolbarRight,
}: {
  data: CommerceTopProductRow[];
  toolbarRight?: React.ReactNode;
}) {
  return (
    <DataTable
      columns={topProductsColumns}
      data={data}
      filterKey="product"
      filterPlaceholder="Search products..."
      disableRowSelection={true}
      toolbarRight={toolbarRight}
    />
  );
}
