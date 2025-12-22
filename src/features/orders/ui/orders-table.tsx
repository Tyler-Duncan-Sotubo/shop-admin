// features/orders/components/orders-table.tsx
"use client";

import { DataTable } from "@/shared/ui/data-table";
import type { Order } from "../types/order.type";
import { orderColumns } from "./order-columns";

export function OrdersTable({ data }: { data: Order[] }) {
  return (
    <DataTable
      columns={orderColumns}
      data={data}
      filterKey="orderNumber"
      filterPlaceholder="Search by order #, id, address..."
    />
  );
}
