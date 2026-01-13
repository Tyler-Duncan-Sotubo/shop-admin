/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import Loading from "@/shared/ui/loading";
import { EmptyState } from "@/shared/ui/empty-state";
import { Button } from "@/shared/ui/button";
import { FaPlus, FaReceipt } from "react-icons/fa";
import { useGetShippingZones } from "../../zones/hooks/use-shipping-zones";
import { useGetShippingRates } from "../hooks/use-shipping-rates";
import { ShippingRateFormModal } from "./shipping-rate-form-modal";
import type { ShippingRate } from "../types/shipping-rate.type";
import { useStoreScope } from "@/lib/providers/store-scope-provider";

import { DataTable } from "@/shared/ui/data-table";
import { shippingRateColumns } from "./shipping-rates-columns";

type Mode = "create" | "edit";

export default function ShippingRatesClient() {
  const { data: session } = useSession();
  const axios = useAxiosAuth();
  const { activeStoreId } = useStoreScope();

  const [zoneId, setZoneId] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("create");
  const [selected, setSelected] = useState<ShippingRate | null>(null);

  const { data: zones = [], isLoading: zonesLoading } = useGetShippingZones(
    session,
    axios,
    activeStoreId
  );

  const { data: rates = [], isLoading } = useGetShippingRates(
    zoneId,
    activeStoreId,
    session,
    axios
  );

  if (zonesLoading || isLoading) return <Loading />;

  const openCreate = () => {
    setMode("create");
    setSelected(null);
    setOpen(true);
  };

  const openEdit = (r: ShippingRate) => {
    setMode("edit");
    setSelected(r);
    setOpen(true);
  };

  const initialValues =
    mode === "edit" && selected
      ? {
          id: selected.id,
          zoneId: selected.zoneId,
          carrierId: selected.carrierId ?? null,
          name: selected.name ?? "",
          calc: selected.calc ?? "flat",
          flatAmount: selected.flatAmount ?? "",
          isDefault: !!selected.isDefault,
          isActive: !!selected.isActive,
          priority: Number(selected.priority ?? 0),
          minDeliveryDays: selected.minDeliveryDays ?? null,
          maxDeliveryDays: selected.maxDeliveryDays ?? null,
        }
      : undefined;

  const hasRates = rates.length > 0;

  return (
    <section className="space-y-6">
      {!hasRates ? (
        <>
          <div className="flex items-center justify-end gap-3">
            <select
              className="h-10 rounded-md border px-3 text-sm"
              value={zoneId ?? ""}
              onChange={(e) => setZoneId(e.target.value || null)}
            >
              <option value="">All zones</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>

            <Button onClick={openCreate}>Create rate</Button>
          </div>

          <EmptyState
            icon={<FaReceipt />}
            title="No shipping rates yet"
            description="Create a rate and assign it to a zone."
            primaryAction={{ label: "Create rate", onClick: openCreate }}
          />
        </>
      ) : (
        <DataTable
          columns={shippingRateColumns({ onEdit: openEdit })}
          data={rates}
          filterKey="name"
          filterPlaceholder="Search rates..."
          toolbarLeft={
            <select
              className="h-10 rounded-md border px-3 text-sm"
              value={zoneId ?? ""}
              onChange={(e) => setZoneId(e.target.value || null)}
            >
              <option value="">All zones</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
          }
          toolbarRight={
            <Button onClick={openCreate}>
              {" "}
              <FaPlus />
              Create rate
            </Button>
          }
        />
      )}

      <ShippingRateFormModal
        open={open}
        onClose={() => setOpen(false)}
        initialValues={initialValues as any}
        mode={mode}
        zones={zones}
      />
    </section>
  );
}
