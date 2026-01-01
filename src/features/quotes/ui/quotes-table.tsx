// features/quotes/components/quotes-table.tsx
"use client";

import { DataTable } from "@/shared/ui/data-table";
import type { Quote } from "../types/quote.type";
import { quoteColumns } from "./quote-columns";

export function QuotesTable({ data }: { data: Quote[] }) {
  return (
    <DataTable
      columns={quoteColumns}
      data={data}
      filterKey="customerEmail"
      filterPlaceholder="Search by email, id..."
    />
  );
}
