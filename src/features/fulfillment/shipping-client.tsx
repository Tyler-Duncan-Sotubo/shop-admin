"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs";
import PageHeader from "@/shared/ui/page-header";
import { FaMapMarkedAlt } from "react-icons/fa";
import { FaReceipt, FaTruckFast } from "react-icons/fa6";

import ShippingZonesClient from "./shipping/zones/ui/shipping-zone-client";
import ShippingRatesClient from "./shipping/rates/ui/shipping-rates-client";
import ShippingCarriersClient from "./shipping/carriers/ui/shipping-carriers-client";
import PickupLocationsClient from "./pickup/ui/pickup-locations-client";

import { FilterChips, type FilterChip } from "@/shared/ui/filter-chips";

type ShippingTabKey = "zones" | "rates" | "carriers" | "pickup";

const DEFAULT_TAB: ShippingTabKey = "zones";

export default function ShippingClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlTab = searchParams.get("tab") as ShippingTabKey | null;
  const [tab, setTab] = useState<ShippingTabKey>(urlTab ?? DEFAULT_TAB);

  // Keep state in sync if user navigates with browser back/forward
  useEffect(() => {
    if (urlTab && urlTab !== tab) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTab(urlTab);
    }
  }, [tab, urlTab]);

  const onTabChange = (next: ShippingTabKey) => {
    setTab(next);
    router.replace(`?tab=${next}`, { scroll: false });
  };

  // Mobile chips (labels kept short; full labels on desktop tabs)
  const chips = useMemo<FilterChip<ShippingTabKey>[]>(
    () => [
      { value: "zones", label: "Zones" },
      { value: "rates", label: "Rates" },
      { value: "carriers", label: "Carriers" },
      { value: "pickup", label: "Pickup" },
    ],
    [],
  );

  return (
    <>
      <PageHeader
        title="Shipping"
        description="Configure where you ship, how much you charge, and which carriers you use."
      />

      <Tabs value={tab} onValueChange={(v) => onTabChange(v as ShippingTabKey)}>
        {/* ✅ Mobile: Filter chips */}
        <div className="sm:hidden -mx-3 px-3 min-w-0">
          <FilterChips<ShippingTabKey>
            value={tab}
            onChange={onTabChange}
            chips={chips}
            wrap={false}
            scrollable
          />
        </div>

        {/* ✅ Desktop: TabsList */}
        <div className="hidden sm:block">
          <TabsList>
            <TabsTrigger value="zones" className="text-base">
              <FaMapMarkedAlt className="mr-2" />
              Zones
            </TabsTrigger>
            <TabsTrigger value="rates" className="text-base">
              <FaReceipt className="mr-2" />
              Rates
            </TabsTrigger>
            <TabsTrigger value="carriers" className="text-base">
              <FaTruckFast className="mr-2" />
              Carriers
            </TabsTrigger>
            <TabsTrigger value="pickup" className="text-base">
              <FaMapMarkedAlt className="mr-2" />
              Pickup Locations
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="zones" className="mt-4">
          <ShippingZonesClient />
        </TabsContent>

        <TabsContent value="rates" className="mt-4">
          <ShippingRatesClient />
        </TabsContent>

        <TabsContent value="carriers" className="mt-4">
          <ShippingCarriersClient />
        </TabsContent>

        <TabsContent value="pickup" className="mt-4">
          <PickupLocationsClient />
        </TabsContent>
      </Tabs>
    </>
  );
}
