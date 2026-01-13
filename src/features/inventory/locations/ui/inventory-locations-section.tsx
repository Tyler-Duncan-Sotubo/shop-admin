"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import Loading from "@/shared/ui/loading";
import { useUpdateMutation } from "@/shared/hooks/use-update-mutation";
import { useInventoryLocations } from "../hooks/use-inventory-locations";
import {
  InventoryLocation,
  UpdateInventoryLocationPayload,
} from "../types/inventory-location.type";
import { InventoryLocationFormValues } from "../schema/inventory-locations.schema";
import { InventoryLocationFormModal } from "./inventory-location-form-modal";
import PageHeader from "@/shared/ui/page-header";
import { FaWarehouse } from "react-icons/fa6";
import { EmptyState } from "@/shared/ui/empty-state";
import { useStoreScope } from "@/lib/providers/store-scope-provider";

import { DataTable } from "@/shared/ui/data-table";
import { inventoryLocationColumns } from "./inventory-location-columns";

export default function InventoryLocationsSection() {
  const { activeStoreId } = useStoreScope();
  const { locations, isLoading, fetchError, createLocation } =
    useInventoryLocations();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<InventoryLocation | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const openCreate = () => {
    setSelected(null);
    setModalMode("create");
    setSubmitError(null);
    setModalOpen(true);
  };

  const openEdit = (loc: InventoryLocation) => {
    setSelected(loc);
    setModalMode("edit");
    setSubmitError(null);
    setModalOpen(true);
  };

  const close = () => setModalOpen(false);

  const updateLocation = useUpdateMutation<UpdateInventoryLocationPayload>({
    endpoint: `/api/inventory/locations/${selected?.id}`,
    successMessage: "Location updated successfully",
    refetchKey: "inventory-locations",
    method: "PATCH",
  });

  const handleSubmit = async (values: InventoryLocationFormValues) => {
    setSubmitError(null);

    if (modalMode === "create") {
      await createLocation(
        {
          name: values.name,
          code: values.code || undefined,
          type: values.type,

          addressLine1: values.addressLine1 || undefined,
          addressLine2: values.addressLine2 || undefined,
          city: values.city || undefined,
          region: values.region || undefined,
          postalCode: values.postalCode || undefined,
          country: values.country || undefined,

          isActive: values.isActive,
          storeId: activeStoreId,
        },
        setSubmitError,
        undefined,
        close
      );
    } else if (modalMode === "edit" && selected) {
      await updateLocation(
        {
          name: values.name,
          code: values.code || undefined,
          type: values.type,

          addressLine1: values.addressLine1 || undefined,
          addressLine2: values.addressLine2 || undefined,
          city: values.city || undefined,
          region: values.region || undefined,
          postalCode: values.postalCode || undefined,
          country: values.country || undefined,

          isActive: values.isActive,
        },
        setSubmitError,
        close
      );
    }
  };

  // ─────────────────────────────────────────────
  // Loading / error / empty
  // ─────────────────────────────────────────────
  if (isLoading) return <Loading />;

  if (fetchError && locations.length === 0) {
    return (
      <p className="text-sm text-destructive">
        Failed to load locations: {fetchError}
      </p>
    );
  }

  const hasLocations = locations.length > 0;

  return (
    <section className="space-y-6 mt-6">
      {!hasLocations ? (
        <EmptyState
          icon={<FaWarehouse />}
          title="No locations yet"
          description="Create a warehouse or store location to start tracking inventory."
          primaryAction={{ label: "Create location", onClick: openCreate }}
        />
      ) : (
        <DataTable
          columns={inventoryLocationColumns(openEdit)}
          data={locations}
          filterKey="name"
          filterPlaceholder="Search locations..."
          toolbarRight={<Button onClick={openCreate}>Create location</Button>}
        />
      )}

      {/* Modal stays mounted so it can open from empty or table */}
      <InventoryLocationFormModal
        open={modalOpen}
        mode={modalMode}
        location={selected}
        onClose={close}
        onSubmit={handleSubmit}
        submitError={submitError}
      />
    </section>
  );
}
