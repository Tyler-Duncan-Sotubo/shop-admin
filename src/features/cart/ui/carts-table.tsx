"use client";

import { DataTable } from "@/shared/ui/data-table";
import type { CartRow } from "../types/cart.type";
import { cartsColumns } from "./carts-columns";

export function CartsTable({ data }: { data: CartRow[] }) {
  return (
    <DataTable
      columns={cartsColumns()}
      data={data}
      filterKey="id"
      filterPlaceholder="Search by cart id..."
    />
  );
}
