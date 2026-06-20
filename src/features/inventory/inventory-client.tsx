"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs";
import { MdOutlineInventory2 } from "react-icons/md";
import { BsFillBoxSeamFill } from "react-icons/bs";
import PageHeader from "@/shared/ui/page-header";
import { InventoryOverview } from "./core/ui/inventory-overview";
import LedgerClient from "./movements/ui/ledger-client";
import InventoryTransferClient from "./transfer/ui/invertory-transfer-client";
import { FilterChip, FilterChips } from "@/shared/ui/filter-chips";
import { DispatchesClient } from "./dispatches/ui/dispatches-client";
import { FaExchangeAlt } from "react-icons/fa";
import { PlanGate } from "../subscription/ui/plan-gate";

type InventoryTabKey = "overview" | "movements" | "transfers" | "dispatches";

export default function InventoryClient() {
  const [tab, setTab] = useState<InventoryTabKey>("overview");

  const chips: FilterChip<InventoryTabKey>[] = [
    { value: "overview", label: "Overview" },
    { value: "movements", label: "Stock Movements" },
    { value: "transfers", label: "Transfers" },
    { value: "dispatches", label: "Dispatches" },
  ];

  return (
    <>
      <PageHeader
        title="Inventory"
        description="Track stock levels, movements, and locations."
        tooltip="Inventory shows where your stock is, how it moves, and how much is available."
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as InventoryTabKey)}>
        {/* Mobile */}
        <div className="min-w-0 px-3 -mx-3 sm:hidden">
          <FilterChips<InventoryTabKey>
            value={tab}
            onChange={setTab}
            chips={chips}
            wrap={false}
            scrollable
          />
        </div>

        {/* Desktop */}
        <div className="hidden sm:block">
          <TabsList>
            <TabsTrigger value="overview" className="text-base">
              <MdOutlineInventory2 className="mr-2" />
              Overview
            </TabsTrigger>

            <TabsTrigger value="movements" className="text-base">
              <MdOutlineInventory2 className="mr-2" />
              Stock Movements
            </TabsTrigger>

            <TabsTrigger value="dispatches" className="text-base">
              <BsFillBoxSeamFill className="mr-2" />
              Dispatches
            </TabsTrigger>

            <TabsTrigger value="transfers" className="text-base">
              <FaExchangeAlt className="mr-2" />
              Transfers
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-10">
          <InventoryOverview />
        </TabsContent>

        <TabsContent value="movements" className="mt-4">
          <LedgerClient />
        </TabsContent>

        <TabsContent value="transfers" className="mt-10">
          <PlanGate feature="multiLocation">
            <InventoryTransferClient />
          </PlanGate>
        </TabsContent>

        <TabsContent value="dispatches" className="mt-4">
          <PlanGate feature="dispatch">
            <DispatchesClient />
          </PlanGate>
        </TabsContent>
      </Tabs>
    </>
  );
}
