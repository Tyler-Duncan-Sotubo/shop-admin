"use client";

import { DataTable } from "@/shared/ui/data-table";
import type { InventoryLedgerRow } from "../types/ledger.type";
import { ledgerColumns } from "./ledger-columns";

export function LedgerTable({ data }: { data: InventoryLedgerRow[] }) {
  return (
    <DataTable
      columns={ledgerColumns()}
      data={data}
      filterKey="note"
      filterPlaceholder="Filter ledger notes..."
      showSearch={false}
    />
  );
}
