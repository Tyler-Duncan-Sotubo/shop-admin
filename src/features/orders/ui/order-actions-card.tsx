// features/orders/components/order-actions-card.tsx
"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import type { OrderWithItems } from "../types/order.type";
import {
  usePayOrder,
  useCancelOrder,
  useFulfillOrder,
} from "../hooks/use-orders";
import type { Session } from "next-auth";
import type { AxiosInstance } from "axios";
import { ConfirmOrderActionDialog } from "./confirm-order-action-dialog";
import { H3 } from "@/shared/ui/typography";

export function OrderActionsCard({
  order,
  session,
  axios,
}: {
  order: OrderWithItems;
  session: Session | null;
  axios: AxiosInstance;
}) {
  const payMut = usePayOrder(session, axios);
  const cancelMut = useCancelOrder(session, axios);
  const fulfillMut = useFulfillOrder(session, axios);

  const isMutating =
    payMut.isPending || cancelMut.isPending || fulfillMut.isPending;

  const canPay = order.status === "pending_payment";
  const canCancel = order.status === "pending_payment";
  const canFulfill = order.status === "paid";

  const [openPay, setOpenPay] = useState(false);
  const [openFulfill, setOpenFulfill] = useState(false);
  const [openCancel, setOpenCancel] = useState(false);

  return (
    <div className="border rounded-lg p-2">
      <div>
        <H3 className="text-lg mb-2 px-4">Actions</H3>
      </div>

      <div className="space-y-3 p-3">
        <Button
          className="w-full"
          disabled={!canPay || isMutating}
          onClick={() => setOpenPay(true)}
        >
          Mark as paid
        </Button>

        <Button
          className="w-full"
          variant="secondary"
          disabled={!canFulfill || isMutating}
          onClick={() => setOpenFulfill(true)}
        >
          Fulfill order
        </Button>

        <Button
          className="w-full"
          variant="destructive"
          disabled={!canCancel || isMutating}
          onClick={() => setOpenCancel(true)}
        >
          Cancel order
        </Button>

        <div className="text-xs text-muted-foreground">
          Actions require confirmation to prevent mistakes.
        </div>

        {/* Modals */}
        <ConfirmOrderActionDialog
          open={openPay}
          onOpenChange={setOpenPay}
          title="Mark order as paid?"
          description="This will change the order status to paid."
          confirmLabel="Yes, mark as paid"
          isLoading={payMut.isPending}
          onConfirm={() =>
            payMut.mutate(order.id, { onSuccess: () => setOpenPay(false) })
          }
        />

        <ConfirmOrderActionDialog
          open={openFulfill}
          onOpenChange={setOpenFulfill}
          title="Fulfill this order?"
          description="This will fulfill the order (reserved → deducted) and mark it as fulfilled."
          confirmLabel="Yes, fulfill"
          isLoading={fulfillMut.isPending}
          onConfirm={() =>
            fulfillMut.mutate(order.id, {
              onSuccess: () => setOpenFulfill(false),
            })
          }
        />

        <ConfirmOrderActionDialog
          open={openCancel}
          onOpenChange={setOpenCancel}
          title="Cancel this order?"
          description="This will cancel the order and release reservations (only pending_payment orders)."
          confirmLabel="Yes, cancel order"
          confirmVariant="destructive"
          requireText={order.orderNumber} // ✅ extra safety
          isLoading={cancelMut.isPending}
          onConfirm={() =>
            cancelMut.mutate(order.id, {
              onSuccess: () => setOpenCancel(false),
            })
          }
        />
      </div>
    </div>
  );
}
