/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import Loading from "@/shared/ui/loading";
import { EmptyState } from "@/shared/ui/empty-state";
import { FaMapMarkedAlt } from "react-icons/fa";

import { useGetZoneLocations } from "../hooks/use-zone-locations";
import { ZoneLocationsTable } from "./zone-locations-table";
import { AddZoneLocationModal } from "./add-zone-location-modal";
import PageHeader from "@/shared/ui/page-header";
import { Button } from "@/shared/ui/button";
import { ShippingZoneLocation } from "../types/shipping-zone-location.type";
import { BackButton } from "@/shared/ui/back-button";

type Mode = "create" | "edit";

export default function ZoneDetailClient({ zoneId }: { zoneId: string }) {
  const { data: session } = useSession();
  const axios = useAxiosAuth();

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("create");
  const [selected, setSelected] = useState<ShippingZoneLocation | null>(null);

  const {
    data = [],
    isLoading,
    error,
  } = useGetZoneLocations(zoneId, session, axios);

  const openCreate = () => {
    setMode("create");
    setSelected(null);
    setOpen(true);
  };

  const openEdit = (loc: ShippingZoneLocation) => {
    setMode("edit");
    setSelected(loc);
    setOpen(true);
  };

  if (isLoading) return <Loading />;

  if (error) {
    return (
      <EmptyState
        icon={<FaMapMarkedAlt />}
        title="Failed to load zone locations"
        description="Something went wrong while loading locations for this zone."
        secondaryAction={{
          label: "Retry",
          onClick: () => window.location.reload(),
        }}
      />
    );
  }

  const hasData = data.length > 0;

  return (
    <div className="space-y-6">
      <BackButton href="/shipping?tab=zones" label="Back to zones" />
      <PageHeader
        title={`Locations for "${data[0]?.zoneName || "Shipping Zone"}"`}
        description="Manage the locations included in this shipping zone."
        tooltip="Zone locations define the specific regions where this shipping zone applies."
      >
        <Button onClick={openCreate}>Add Location</Button>
      </PageHeader>

      {!hasData ? (
        <EmptyState
          icon={<FaMapMarkedAlt />}
          title="No locations in this zone yet"
          description="Add locations to this zone to start organizing delivery areas."
          primaryAction={{ label: "Add location", onClick: openCreate }}
        />
      ) : (
        <ZoneLocationsTable data={data} onEdit={openEdit} />
      )}

      <AddZoneLocationModal
        open={open}
        onClose={() => setOpen(false)}
        zoneId={zoneId}
        initialValues={selected as any}
        mode={mode}
      />
    </div>
  );
}
