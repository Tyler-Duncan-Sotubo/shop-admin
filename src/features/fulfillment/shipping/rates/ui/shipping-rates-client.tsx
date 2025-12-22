/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import PageHeader from "@/shared/ui/page-header";
import Loading from "@/shared/ui/loading";
import { EmptyState } from "@/shared/ui/empty-state";
import { Button } from "@/shared/ui/button";
import { FaReceipt } from "react-icons/fa";
import { useGetShippingZones } from "../../zones/hooks/use-shipping-zones";
import { useGetShippingRates } from "../hooks/use-shipping-rates";
import { ShippingRatesTable } from "./shipping-rates-table";
import { ShippingRateFormModal } from "./shipping-rate-form-modal";
import type { ShippingRate } from "../types/shipping-rate.type";
import { useStoreScope } from "@/lib/providers/store-scope-provider";

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

  if (zonesLoading || isLoading) return <Loading />;

  const hasRates = rates.length > 0;

  return (
    <section className="space-y-6">
      <PageHeader
        title="Shipping Rates"
        description="Define how much shipping costs per zone."
        tooltip="Rates belong to zones and are selected based on priority and default rules."
      >
        <div className="flex items-center gap-3">
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
      </PageHeader>

      {!hasRates ? (
        <EmptyState
          icon={<FaReceipt />}
          title="No shipping rates yet"
          description="Create a rate and assign it to a zone."
          primaryAction={{ label: "Create rate", onClick: openCreate }}
        />
      ) : (
        <ShippingRatesTable data={rates} onEdit={openEdit} />
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
