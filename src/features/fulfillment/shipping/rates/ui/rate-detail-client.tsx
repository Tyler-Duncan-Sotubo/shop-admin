"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";

import PageHeader from "@/shared/ui/page-header";
import Loading from "@/shared/ui/loading";
import { EmptyState } from "@/shared/ui/empty-state";
import { Button } from "@/shared/ui/button";
import { FaWeightHanging } from "react-icons/fa";

import { useGetRateTiers } from "../hooks/use-rate-tiers";
import { RateTiersTable } from "./rate-tiers-table";
import { RateTierFormModal } from "./rate-tier-form-modal";
import type { ShippingRateTier } from "../types/shipping-rate-tier.type";

export default function RateDetailClient({ rateId }: { rateId: string }) {
  const { data: session } = useSession();
  const axios = useAxiosAuth();

  const { data: tiers = [], isLoading } = useGetRateTiers(
    rateId,
    session,
    axios
  );

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selected, setSelected] = useState<ShippingRateTier | null>(null);

  if (isLoading) return <Loading />;

  const openCreate = () => {
    setMode("create");
    setSelected(null);
    setOpen(true);
  };

  const openEdit = (t: ShippingRateTier) => {
    setMode("edit");
    setSelected(t);
    setOpen(true);
  };

  return (
    <section className="space-y-6">
      <PageHeader
        title="Rate Tiers"
        description="Configure weight-based shipping prices for this rate."
        tooltip="The system selects the first tier that matches the cart’s total weight."
      >
        <Button onClick={openCreate}>Add tier</Button>
      </PageHeader>

      {tiers.length === 0 ? (
        <EmptyState
          icon={<FaWeightHanging />}
          title="No tiers yet"
          description="Add at least one tier so this weight-based rate can return a shipping amount."
          primaryAction={{ label: "Add tier", onClick: openCreate }}
        />
      ) : (
        <RateTiersTable data={tiers} onEdit={openEdit} />
      )}

      <RateTierFormModal
        open={open}
        onClose={() => setOpen(false)}
        mode={mode}
        rateId={rateId}
        initialValues={
          selected
            ? {
                id: selected.id,
                rateId: selected.rateId,
                minWeightGrams: selected.minWeightGrams ?? 0,
                maxWeightGrams: selected.maxWeightGrams ?? 0,
                amount: selected.amount ?? "",
                priority: Number(selected.priority ?? 0),
              }
            : undefined
        }
      />
    </section>
  );
}
