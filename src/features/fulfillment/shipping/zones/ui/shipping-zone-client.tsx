"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { useGetShippingZones } from "../hooks/use-shipping-zones";
import { ShippingZoneFormModal } from "./shipping-zone-form-modal";
import { EmptyState } from "@/shared/ui/empty-state";
import { Button } from "@/shared/ui/button";
import { FaMapMarkedAlt } from "react-icons/fa";
import Loading from "@/shared/ui/loading";
import type { ShippingZone } from "../types/shipping-zone.type";
import { useStoreScope } from "@/lib/providers/store-scope-provider";

import { DataTable } from "@/shared/ui/data-table";
import { shippingZoneColumns } from "./shipping-zones-columns";
import { FaPlus } from "react-icons/fa6";

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

  if (isLoading) return <Loading />;

  const hasZones = zones.length > 0;

  const openCreate = () => {
    setMode("create");
    setSelected(null);
    setOpen(true);
  };

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
      {!hasZones ? (
        <EmptyState
          icon={<FaMapMarkedAlt />}
          title="No shipping zones yet"
          description="Create a shipping zone to start configuring delivery regions and rates."
          primaryAction={{ label: "Create zone", onClick: openCreate }}
        />
      ) : (
        <DataTable
          columns={shippingZoneColumns({ onEdit: openEdit })}
          data={zones}
          filterKey="name"
          filterPlaceholder="Search zones..."
          toolbarRight={
            <Button onClick={openCreate}>
              <FaPlus />
              Create zone
            </Button>
          }
        />
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
