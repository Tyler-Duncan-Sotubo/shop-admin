"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { EmptyState } from "@/shared/ui/empty-state";
import { Button } from "@/shared/ui/button";
import Loading from "@/shared/ui/loading";

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

type Mode = "create" | "edit";

export default function PickupLocationsClient() {
  const { data: session } = useSession();
  const axios = useAxiosAuth();
  const { activeStoreId } = useStoreScope();

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("create");
  const [selected, setSelected] = useState<PickupLocation | null>(null);

  const { data: locations = [], isLoading } = useGetPickupLocations(
    session,
    axios,
    activeStoreId
  );

  const createMut = useCreatePickupLocation(session, axios);
  const updateMut = useUpdatePickupLocation(session, axios);
  const isSubmitting = createMut.isPending || updateMut.isPending;

  if (isLoading) return <Loading />;

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

  const hasData = locations.length > 0;

  return (
    <section className="space-y-6">
      {!hasData ? (
        <>
          <div className="flex justify-end">
            <Button onClick={openCreate}>
              <FaPlus />
              Create pickup location
            </Button>
          </div>

          <EmptyState
            title="No pickup locations yet"
            description="Create a pickup location to enable pickup checkout."
            primaryAction={{
              label: "Create pickup location",
              onClick: openCreate,
            }}
          />
        </>
      ) : (
        <DataTable
          columns={pickupLocationColumns({ onEdit: openEdit })}
          data={locations}
          filterKey="name"
          filterPlaceholder="Filter pickup locations..."
          toolbarRight={
            <Button onClick={openCreate}>
              <FaPlus />
              Create pickup location
            </Button>
          }
        />
      )}

      <PickupLocationFormModal
        open={open}
        onClose={() => setOpen(false)}
        mode={mode}
        initialValues={selected}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </section>
  );
}
