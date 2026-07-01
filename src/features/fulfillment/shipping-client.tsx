"use client";

import { useState } from "react";
import PageHeader from "@/shared/ui/page-header";
import { Tabs, TabsContent } from "@/shared/ui/tabs";

import ShippingOptionsClient from "./shipping/options/ui/shipping-options-client";
import { type ShippingTab } from "./shipping-tabs";
import PickupLocationsClient from "./pickup/ui/pickup-locations-client";

export default function ShippingClient() {
  const [tab, setTab] = useState<ShippingTab>("options");

  return (
    <>
      <PageHeader
        title="Shipping"
        description="Configure shipping options and pickup locations for your customers."
        tooltip="Customers choose their shipping option at checkout. Each option has a flat fee and applies to the states you select — leave states empty to make it available nationwide."
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as ShippingTab)}>
        <TabsContent value="options" className="mt-0">
          <ShippingOptionsClient tab={tab} onTabChange={setTab} />
        </TabsContent>
        <TabsContent value="pickup" className="mt-0">
          <PickupLocationsClient tab={tab} onTabChange={setTab} />
        </TabsContent>
      </Tabs>
    </>
  );
}
