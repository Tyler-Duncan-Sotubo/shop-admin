"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useManualOrders } from "../hooks/use-manual-orders";
import { ManualOrderFormValues } from "../schema/manual-orders.schema";
import { ManualOrderFormModal } from "./manual-order-form-modal";
import { Button } from "@/shared/ui/button";

export function CreateManualOrderButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const { createManualOrder } = useManualOrders();

  const handleCreate = async (values: ManualOrderFormValues) => {
    const created = await createManualOrder(values);

    // created might be {data: ...} depending on your hook wrapper
    const orderId = (created?.data?.id ?? created?.id) as string;

    setOpen(false);
    router.push(`/orders/${orderId}`);
  };

  return (
    <>
      <Button className="btn" onClick={() => setOpen(true)}>
        Create Manual Order
      </Button>

      <ManualOrderFormModal
        open={open}
        mode="create"
        onClose={() => setOpen(false)}
        onSubmit={handleCreate}
      />
    </>
  );
}
