"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import InventoryTransferClient from "./invertory-transfer-client";
import { StoreTransferHistoryTable } from "./store-transfer-history-client";

export default function InventoryTransfersTabs() {
  return (
    <Tabs defaultValue="transfers" className="space-y-4 mt-0">
      <TabsList>
        <TabsTrigger value="transfers">Transfers</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
      </TabsList>

      <TabsContent value="transfers" className="space-y-4">
        <InventoryTransferClient />
      </TabsContent>

      <TabsContent value="history" className="space-y-4">
        <StoreTransferHistoryTable />
      </TabsContent>
    </Tabs>
  );
}
