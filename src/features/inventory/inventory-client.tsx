"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs";
import { MdOutlineInventory2 } from "react-icons/md";
import { BsFillBoxSeamFill } from "react-icons/bs";
import { FaMapMarkedAlt } from "react-icons/fa";
import PageHeader from "@/shared/ui/page-header";
import { InventoryOverview } from "./core/ui/inventory-overview";
import InventoryLocationsSection from "./locations/ui/inventory-locations-section";
import LedgerClient from "./movements/ui/ledger-client";
import InventoryTransferClient from "./transfer/ui/invertory-transfer-client";

type InventoryTabKey = "overview" | "movements" | "transfers" | "locations";

export default function InventoryClient() {
  const [tab, setTab] = useState<InventoryTabKey>("overview");

  return (
    <>
      <PageHeader
        title="Inventory"
        description="Track stock levels, movements, and locations."
        tooltip="Inventory shows where your stock is, how it moves, and how much is available."
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as InventoryTabKey)}>
        <TabsList>
          <TabsTrigger value="overview" className="text-base">
            <MdOutlineInventory2 className="mr-2" />
            Overview
          </TabsTrigger>

          <TabsTrigger value="movements" className="text-base">
            <MdOutlineInventory2 className="mr-2" />
            Stock Movements
          </TabsTrigger>

          <TabsTrigger value="transfers" className="text-base">
            <BsFillBoxSeamFill className="mr-2" />
            Transfers
          </TabsTrigger>

          <TabsTrigger value="locations" className="text-base">
            <FaMapMarkedAlt className="mr-2" />
            Locations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-10">
          <InventoryOverview />
        </TabsContent>

        <TabsContent value="movements" className="mt-4">
          <LedgerClient />
        </TabsContent>

        <TabsContent value="transfers" className="mt-10">
          <InventoryTransferClient />
        </TabsContent>

        <TabsContent value="locations" className="mt-10">
          <InventoryLocationsSection />
        </TabsContent>
      </Tabs>
    </>
  );
}
