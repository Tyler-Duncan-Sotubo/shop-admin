// features/pickup/components/pickup-locations-client.tsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { Button } from "@/shared/ui/button";

import type { PickupLocation } from "../types/pickup-location.type";
import {
  useGetPickupLocations,
  useCreatePickupLocation,
  useUpdatePickupLocation,
} from "../hooks/use-pickup-locations";
import { PickupLocationFormModal } from "./pickup-location-form-modal";
import { PickupLocationValues } from "../schema/pickup-location.schema";
import { useStoreScope } from "@/lib/providers/store-scope-provider";

import { DataTable } from "@/shared/ui/data-table";
import { pickupLocationColumns } from "./pickup-location-columns";
import { FaPlus } from "react-icons/fa";
import { PickupLocationMobileRow } from "./pickup-location-mobile-row";
import { FilterChips } from "@/shared/ui/filter-chips";
import {
  SHIPPING_TAB_CHIPS,
  type ShippingTab,
} from "@/features/fulfillment/shipping-tabs";

type Mode = "create" | "edit";

export default function PickupLocationsClient({
  tab,
  onTabChange,
}: {
  tab?: ShippingTab;
  onTabChange?: (t: ShippingTab) => void;
}) {
  const { data: session } = useSession();
  const axios = useAxiosAuth();
  const { activeStoreId } = useStoreScope();

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("create");
  const [selected, setSelected] = useState<PickupLocation | null>(null);

  const { data: locations = [], isLoading } = useGetPickupLocations(
    session,
    axios,
    activeStoreId,
  );

  const createMut = useCreatePickupLocation(session, axios);
  const updateMut = useUpdatePickupLocation(session, axios);
  const isSubmitting = createMut.isPending || updateMut.isPending;

  const openCreate = () => {
    setMode("create");
    setSelected(null);
    setOpen(true);
  };

  const openEdit = (row: PickupLocation) => {
    setMode("edit");
    setSelected(row);
    setOpen(true);
  };

  const handleSubmit = async (values: PickupLocationValues) => {
    const payload = {
      name: values.name,
      inventoryLocationId: values.inventoryLocationId ?? null,
      isActive: values.isActive,
      instructions: values.instructions ?? null,
      address1: values.address1,
      address2: values.address2 ?? null,
      state: values.state,
      storeId: activeStoreId,
    };

    if (mode === "create") {
      await createMut.mutateAsync(payload);
    } else if (mode === "edit" && selected) {
      await updateMut.mutateAsync({ id: selected.id, input: payload });
    }
  };

  return (
    <>
      <DataTable
        columns={pickupLocationColumns({ onEdit: openEdit })}
        data={isLoading ? [] : locations}
        filterKey="name"
        filterPlaceholder="Filter pickup locations..."
        mobileRow={PickupLocationMobileRow}
        tableMeta={{ onEdit: openEdit }}
        emptyState={{
          title: "No pickup locations yet",
          description: "Create a pickup location to enable pickup checkout.",
          action: (
            <Button size="sm" onClick={openCreate}>
              <FaPlus className="w-3 h-3 mr-1" />
              Create pickup location
            </Button>
          ),
        }}
        toolbarLeft={
          tab !== undefined && onTabChange ? (
            <FilterChips<ShippingTab>
              value={tab}
              onChange={onTabChange}
              chips={SHIPPING_TAB_CHIPS}
              wrap={false}
              scrollable
            />
          ) : undefined
        }
        toolbarRight={
          <Button onClick={openCreate}>
            <FaPlus className="w-3 h-3 mr-1" />
            Create pickup location
          </Button>
        }
      />

      <PickupLocationFormModal
        open={open}
        onClose={() => setOpen(false)}
        mode={mode}
        initialValues={selected}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
