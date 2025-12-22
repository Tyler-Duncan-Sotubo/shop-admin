"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { useGetShippingZones } from "../hooks/use-shipping-zones";
import { ShippingZonesTable } from "./shipping-zones-table";
import { ShippingZoneFormModal } from "./shipping-zone-form-modal";
import PageHeader from "@/shared/ui/page-header";
import { EmptyState } from "@/shared/ui/empty-state";
import { Button } from "@/shared/ui/button";
import { FaMapMarkedAlt } from "react-icons/fa";
import Loading from "@/shared/ui/loading";
import { ShippingZone } from "../types/shipping-zone.type";
import { useStoreScope } from "@/lib/providers/store-scope-provider";

type Mode = "create" | "edit";

export default function ShippingZonesClient() {
  const { data: session } = useSession();
  const axios = useAxiosAuth();
  const { activeStoreId } = useStoreScope();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("create");
  const [selected, setSelected] = useState<ShippingZone | null>(null);
  const { data: zones = [], isLoading } = useGetShippingZones(
    session,
    axios,
    activeStoreId
  );
  // ─────────────────────────────────────────────
  // Loading
  // ─────────────────────────────────────────────
  if (isLoading) {
    return <Loading />;
  }

  const hasZones = zones.length > 0;

  const openEdit = (zone: ShippingZone) => {
    setMode("edit");
    setSelected(zone);
    setOpen(true);
  };

  const initialValues =
    mode === "edit" && selected
      ? {
          id: selected.id,
          name: selected.name ?? "",
          priority: Number(selected.priority ?? 0),
          isActive: Boolean(selected.isActive),
        }
      : undefined;

  return (
    <section className="space-y-6">
      <PageHeader
        title="Shipping Zones"
        description="Define where and how products can be shipped."
        tooltip="Shipping zones let you control delivery availability and pricing by region."
      >
        <Button onClick={() => setOpen(true)}>Create zone</Button>
      </PageHeader>

      {!hasZones ? (
        <div>
          <EmptyState
            icon={<FaMapMarkedAlt />}
            title="No shipping zones yet"
            description="Create a shipping zone to start configuring delivery regions and rates."
            primaryAction={{
              label: "Create zone",
              onClick: () => setOpen(true),
            }}
          />
        </div>
      ) : (
        <ShippingZonesTable data={zones} onEdit={openEdit} />
      )}

      <ShippingZoneFormModal
        open={open}
        onClose={() => setOpen(false)}
        initialValues={initialValues}
        mode={mode}
      />
    </section>
  );
}
