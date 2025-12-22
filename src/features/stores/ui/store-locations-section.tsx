"use client";

import { useState } from "react";
import Loading from "@/shared/ui/loading";
import { Button } from "@/shared/ui/button";
import { useStoreLocations } from "../hooks/use-store-locations";
import { useInventoryLocations } from "../hooks/use-inventory-locations";
import { StoreLocationsFormModal } from "./store-locations-form-modal";
import { StoreLocationsTable } from "./store-locations-table";
import PageHeader from "@/shared/ui/page-header";
import { useUpdateMutation } from "@/shared/hooks/use-update-mutation";

export function StoreLocationsSection({ storeId }: { storeId: string }) {
  const { storeLocations, assignedLocationIds, isLoading } =
    useStoreLocations(storeId);

  const { locations: allLocations, isLoading: inventoryLoading } =
    useInventoryLocations();

  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const updateStoreLocations = useUpdateMutation({
    endpoint: `/api/inventory/stores/${storeId}/locations`,
    successMessage: "Store locations updated",
    refetchKey: "store-locations inventory store, locations",
  });

  if (isLoading || inventoryLoading) return <Loading />;

  const handleSubmit = async (ids: string[]) => {
    setSubmitError(null);
    await updateStoreLocations({ locationIds: ids }, setSubmitError);
    setOpen(false);
  };

  const hasAssigned = storeLocations.length > 0;

  return (
    <div>
      <PageHeader
        title="Store Locations"
        description="Manage which inventory locations are assigned to this store."
        tooltip="Inventory is managed at the location level. Assign locations to control where this store can fulfill orders from."
      >
        <Button onClick={() => setOpen(true)}>Manage locations</Button>
      </PageHeader>

      {!hasAssigned ? (
        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground mt-10">
          No locations assigned yet. Click{" "}
          <span className="font-medium">Manage locations</span> to assign at
          least one warehouse.
        </div>
      ) : (
        <StoreLocationsTable data={storeLocations} />
      )}

      <StoreLocationsFormModal
        open={open}
        allLocations={allLocations}
        assignedLocationIds={assignedLocationIds}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        submitError={submitError}
      />
    </div>
  );
}
