"use client";

import { DataTable } from "@/shared/ui/data-table";
import { cartItemsColumns } from "./cart-items-columns";
import { CartItemRow } from "../types/cart.type";

export function CartItemsTable({ data }: { data: CartItemRow[] }) {
  return (
    <DataTable
      columns={cartItemsColumns()}
      data={data}
      filterKey="name"
      filterPlaceholder="Search items..."
    />
  );
}
