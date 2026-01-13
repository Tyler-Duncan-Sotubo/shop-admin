/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import Loading from "@/shared/ui/loading";
import { DataTable } from "@/shared/ui/data-table";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";

import {
  useGetInventoryOverview,
  useGetStoreLocations,
} from "../hooks/use-inventory";
import { inventoryColumns } from "./inventory-columns";
import type {
  InventoryGroupRow,
  InventoryOverviewQuery,
} from "../types/inventory.type";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import { ArrowRightLeft } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { CreateTransferModal } from "../../transfer/ui/create-transfer-modal";
import { EmptyState } from "@/shared/ui/empty-state";
import { FaStore, FaWarehouse } from "react-icons/fa";

export function InventoryOverview() {
  const { data: session, status: authStatus } = useSession();
  const axios = useAxiosAuth();
  const { activeStoreId } = useStoreScope();

  const [openTransfer, setOpenTransfer] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [locationId, setLocationId] = useState<string | null>(null);

  // ─────────────────────────────────────────────
  // 1) Fetch locations for active store
  // ─────────────────────────────────────────────
  const { data: locations = [], isLoading: locationsLoading } =
    useGetStoreLocations(activeStoreId, session, axios);
  // ─────────────────────────────────────────────
  // 2) Sort locations: warehouse → primary → name
  // ─────────────────────────────────────────────
  const locationTabs = useMemo(() => {
    const active = locations.filter((l) => l.isActive);

    return [...active].sort((a, b) => {
      // warehouse first
      const aWarehouse = a.type === "warehouse" ? 0 : 1;
      const bWarehouse = b.type === "warehouse" ? 0 : 1;
      if (aWarehouse !== bWarehouse) return aWarehouse - bWarehouse;

      // primary next
      const aPrimary = a.isPrimary ? 0 : 1;
      const bPrimary = b.isPrimary ? 0 : 1;
      if (aPrimary !== bPrimary) return aPrimary - bPrimary;

      // name fallback
      return (a.name ?? "").localeCompare(b.name ?? "");
    });
  }, [locations]);

  // ─────────────────────────────────────────────
  // 3) Pick default location (warehouse > primary)
  //    ✅ Still sets locationId, but UI can render tabs even before this runs
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!locationTabs.length) return;

    const next = locationTabs[0]; // already sorted
    const stillValid = locationTabs.some((l) => l.locationId === locationId);

    if (!locationId || !stillValid) {
      setLocationId(next.locationId);
    }
  }, [locationTabs, locationId]);

  // ✅ Always provide Tabs a valid value once we have tabs
  const tabsValue = useMemo(() => {
    return locationId || locationTabs[0]?.locationId || "";
  }, [locationId, locationTabs]);

  const currentLocationName =
    locationTabs.find((l) => l.locationId === tabsValue)?.name ?? "Location";

  // ─────────────────────────────────────────────
  // 4) Inventory overview query
  // ─────────────────────────────────────────────
  const query = useMemo<InventoryOverviewQuery | null>(() => {
    if (!activeStoreId) return null;

    return {
      locationId: tabsValue || undefined,
      limit: 1000,
      offset: 0,
      storeId: activeStoreId!,
    };
  }, [tabsValue, activeStoreId]);

  const { data: rows = [] } = useGetInventoryOverview(query, session, axios);

  // ─────────────────────────────────────────────
  // 5) Group Variants by Product
  // ─────────────────────────────────────────────
  const groupedRows = useMemo<InventoryGroupRow[]>(() => {
    const map = new Map<string, InventoryGroupRow>();

    for (const r of rows) {
      const key = r.productName ?? "Unknown product";

      const g = map.get(key) ?? {
        productName: key,
        inStock: 0,
        committed: 0,
        onHand: 0,
        lowStock: false,
        children: [],
      };

      g.inStock += Number(r.inStock ?? 0);
      g.committed += Number(r.committed ?? 0);
      g.onHand += Number(r.onHand ?? 0);
      g.lowStock = g.lowStock || Boolean(r.lowStock);
      g.children.push(r);

      map.set(key, g);
    }

    for (const g of map.values()) {
      g.children.sort((a, b) =>
        (a.variantTitle ?? "").localeCompare(b.variantTitle ?? "")
      );
    }

    return Array.from(map.values()).sort((a, b) =>
      a.productName.localeCompare(b.productName)
    );
  }, [rows]);

  const toggleExpanded = (productName: string) => {
    setExpanded((prev) => ({ ...prev, [productName]: !prev[productName] }));
  };

  const tableRows = useMemo(() => {
    const out = [];
    for (const g of groupedRows) {
      out.push(g);
      if (expanded[g.productName]) out.push(...g.children);
    }
    return out;
  }, [groupedRows, expanded]);

  // ─────────────────────────────────────────────
  // Loading / top-level empty states
  // ─────────────────────────────────────────────
  if (authStatus === "loading" || locationsLoading) return <Loading />;

  // No store selected
  if (!activeStoreId && locations.length === 0) {
    return (
      <EmptyState
        icon={<FaStore />}
        title="No store selected"
        description="Select or create a store to view inventory."
        secondaryAction={{
          label: "Manage stores",
          href: "/settings/stores",
        }}
      />
    );
  }

  // No locations exist at all
  if (locations.length === 0) {
    return (
      <EmptyState
        icon={<FaWarehouse />}
        title="No locations yet"
        description="Create a warehouse or store location to start tracking inventory."
        primaryAction={{
          label: "Create location",
          href: `/settings/stores/${activeStoreId}`,
        }}
      />
    );
  }

  // Locations exist but none active
  if (locationTabs.length === 0) {
    return (
      <EmptyState
        icon={<FaWarehouse />}
        title="No active locations"
        description="You have locations, but none are active. Activate one to view inventory."
        primaryAction={{ label: "Manage locations", href: "/locations" }}
      />
    );
  }

  // ─────────────────────────────────────────────
  // Render (Tabs ALWAYS show once we have locationTabs)
  // ─────────────────────────────────────────────
  return (
    <section className="space-y-4">
      <Tabs value={tabsValue} onValueChange={setLocationId}>
        <DataTable
          columns={inventoryColumns(tabsValue, expanded, toggleExpanded)}
          data={tableRows}
          filterKey="productName"
          filterPlaceholder="Search by product name or SKU..."
          toolbarLeft={
            <TabsList>
              {locationTabs.map((l) => (
                <TabsTrigger key={l.locationId} value={l.locationId}>
                  {l.name}
                </TabsTrigger>
              ))}
            </TabsList>
          }
          toolbarRight={
            <Button onClick={() => setOpenTransfer(true)} disabled={!tabsValue}>
              <ArrowRightLeft className="mr-2" size={16} />
              Transfer
            </Button>
          }
        />
      </Tabs>

      <CreateTransferModal
        open={openTransfer}
        onClose={() => setOpenTransfer(false)}
        fromLocationId={tabsValue}
        fromLocationName={currentLocationName}
        locations={locationTabs}
        rows={rows}
      />
    </section>
  );
}
