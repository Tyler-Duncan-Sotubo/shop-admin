"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";

import { useGetShippingCarriers } from "../hooks/use-shipping-carriers";
import { ShippingCarrierFormModal } from "./shipping-carrier-form-modal";

import { EmptyState } from "@/shared/ui/empty-state";
import { Button } from "@/shared/ui/button";
import Loading from "@/shared/ui/loading";
import { FaTruck } from "react-icons/fa";
import type { ShippingCarrier } from "../types/shipping-carrier.type";

import { DataTable } from "@/shared/ui/data-table";
import { shippingCarrierColumns } from "./shipping-carrier-columns";
import { FaPlus } from "react-icons/fa6";

export default function ShippingCarriersClient() {
  const { data: session } = useSession();
  const axios = useAxiosAuth();

  const { data: carriers = [], isLoading } = useGetShippingCarriers(
    session,
    axios
  );

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<ShippingCarrier | null>(null);

  if (isLoading) return <Loading />;

  const openCreate = () => {
    setSelected(null);
    setMode("create");
    setOpen(true);
  };

  const openEdit = (carrier: ShippingCarrier) => {
    setSelected(carrier);
    setMode("edit");
    setOpen(true);
  };

  const hasCarriers = carriers.length > 0;

  return (
    <section className="space-y-6">
      {!hasCarriers ? (
        <>
          <div className="flex justify-end">
            <Button onClick={openCreate}>
              <FaPlus />
              Create carrier
            </Button>
          </div>

          <EmptyState
            icon={<FaTruck />}
            title="No carriers yet"
            description="Create a carrier to start assigning shipping rates."
            primaryAction={{ label: "Create carrier", onClick: openCreate }}
          />
        </>
      ) : (
        <DataTable
          columns={shippingCarrierColumns(openEdit)}
          data={carriers}
          filterKey="name"
          filterPlaceholder="Search carriers..."
          toolbarRight={
            <Button onClick={openCreate}>
              <FaPlus />
              Create carrier
            </Button>
          }
        />
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
