// src/features/analytics/commerce/ui/top-products-data-table.tsx
"use client";

import { DataTable } from "@/shared/ui/data-table";
import { topProductsColumns } from "./top-products-columns";
import { TopProductsMobileRow } from "./top-products-mobile-row";
import type { CommerceTopProductRow } from "../../overview/types/commerce-analytics.type";

export function TopProductsDataTable({
  data,
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
      mobileRow={TopProductsMobileRow}
    />
  );
}
