/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import type { OrderWithItems } from "../types/order.type";
import {
  usePayOrder,
  useCancelOrder,
  useFulfillOrder,
  useConvertToLayBuy, // 👈 new hook — see below
} from "../hooks/use-orders";
import type { Session } from "next-auth";
import type { AxiosInstance } from "axios";
import { ConfirmOrderActionDialog } from "./confirm-order-action-dialog";
import { H3 } from "@/shared/ui/typography";

export function OrderActionsCard({
  order,
  session,
  axios,
  canUpdate = false, // Default to false if not provided
}: {
  order: OrderWithItems;
  session: Session | null;
  axios: AxiosInstance;
  canUpdate?: boolean; // Optional prop to control update permissions
}) {
  const payMut = usePayOrder(session, axios);
  const cancelMut = useCancelOrder(session, axios);
  const fulfillMut = useFulfillOrder(session, axios);
  const layBuyMut = useConvertToLayBuy(session, axios);

  const fulfillError = fulfillMut.error as Error | null;
  const cancelError = cancelMut.isError
    ? ((cancelMut.error as any)?.response?.data?.error?.message ??
      "Unable to cancel order")
    : null;

  const isMutating =
    payMut.isPending ||
    cancelMut.isPending ||
    fulfillMut.isPending ||
    layBuyMut.isPending;

  const canFulfill = order.status === "paid" || order.status === "lay_buy";
  const canCancel =
    order.status === "pending_payment" || order.status === "lay_buy";
  const canConvertToLayBuy =
    order.status === "pending_payment" || order.status === "draft";

  const [openFulfill, setOpenFulfill] = useState(false);
  const [openCancel, setOpenCancel] = useState(false);
  const [openLayBuy, setOpenLayBuy] = useState(false);

  return (
    <div className="border rounded-lg p-2">
      <div>
        <H3 className="text-lg mb-2 px-4">Actions</H3>
      </div>

      <div className="space-y-3 p-3">
        <Button
          className="w-full"
          variant="secondary"
          disabled={!canFulfill || !canUpdate || isMutating}
          onClick={() => setOpenFulfill(true)}
        >
          Fulfill order
        </Button>

        {canConvertToLayBuy && (
          <Button
            className="w-full"
            variant="outline"
            disabled={!canUpdate || isMutating}
            onClick={() => setOpenLayBuy(true)}
          >
            Convert to lay-buy
          </Button>
        )}

        <Button
          className="w-full"
          variant="destructive"
          disabled={!canCancel || !canUpdate || isMutating}
          onClick={() => setOpenCancel(true)}
        >
          Cancel order
        </Button>

        <div className="text-xs text-muted-foreground">
          Actions require confirmation to prevent mistakes.
        </div>

        <ConfirmOrderActionDialog
          open={openFulfill}
          onOpenChange={setOpenFulfill}
          title="Fulfill this order?"
          description="This will fulfill the order (reserved → deducted) and mark it as fulfilled."
          confirmLabel="Yes, fulfill"
          isLoading={fulfillMut.isPending}
          error={fulfillError?.message}
          onConfirm={() =>
            fulfillMut.mutate(order.id, {
              onSuccess: () => setOpenFulfill(false),
            })
          }
        />

        <ConfirmOrderActionDialog
          open={openLayBuy}
          onOpenChange={setOpenLayBuy}
          title="Convert to lay-buy?"
          description="The order will be fulfilled now and payment collected later. The customer will still owe the full amount."
          confirmLabel="Yes, convert to lay-buy"
          isLoading={layBuyMut.isPending}
          onConfirm={() =>
            layBuyMut.mutate(order.id, {
              onSuccess: () => setOpenLayBuy(false),
            })
          }
        />

        <ConfirmOrderActionDialog
          open={openCancel}
          onOpenChange={setOpenCancel}
          title="Cancel this order?"
          description="This will cancel the order and release any reservations."
          confirmLabel="Yes, cancel order"
          confirmVariant="destructive"
          requireText={order.orderNumber}
          isLoading={cancelMut.isPending}
          onConfirm={() =>
            cancelMut.mutate(order.id, {
              onSuccess: () => setOpenCancel(false),
            })
          }
          error={cancelError}
        />
      </div>
    </div>
  );
}
