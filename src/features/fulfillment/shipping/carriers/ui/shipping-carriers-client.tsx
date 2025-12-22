"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";

import { useGetShippingCarriers } from "../hooks/use-shipping-carriers";
import { ShippingCarriersTable } from "./shipping-carriers-table";
import { ShippingCarrierFormModal } from "./shipping-carrier-form-modal";

import PageHeader from "@/shared/ui/page-header";
import { EmptyState } from "@/shared/ui/empty-state";
import { Button } from "@/shared/ui/button";
import Loading from "@/shared/ui/loading";
import { FaTruck } from "react-icons/fa";
import { ShippingCarrier } from "../types/shipping-carrier.type";

export default function ShippingCarriersClient() {
  const { data: session } = useSession();
  const axios = useAxiosAuth();

  const { data = [], isLoading } = useGetShippingCarriers(session, axios);

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<ShippingCarrier | null>(null);

  if (isLoading) return <Loading />;

  const openEdit = (carrier: ShippingCarrier) => {
    setSelected(carrier);
    setMode("edit");
    setOpen(true);
  };

  return (
    <section className="space-y-6">
      <PageHeader
        title="Shipping Carriers"
        description="Manage shipping providers used for delivery rates."
      >
        <Button
          onClick={() => {
            setSelected(null);
            setMode("create");
            setOpen(true);
          }}
        >
          Create carrier
        </Button>
      </PageHeader>

      {data.length === 0 ? (
        <EmptyState
          icon={<FaTruck />}
          title="No carriers yet"
          description="Create a carrier to start assigning shipping rates."
          primaryAction={{
            label: "Create carrier",
            onClick: () => setOpen(true),
          }}
        />
      ) : (
        <ShippingCarriersTable data={data} onEdit={openEdit} />
      )}

      <ShippingCarrierFormModal
        open={open}
        onClose={() => setOpen(false)}
        mode={mode}
        initialValues={selected ?? undefined}
      />
    </section>
  );
}
