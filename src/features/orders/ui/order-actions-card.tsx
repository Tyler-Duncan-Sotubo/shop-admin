/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import type { OrderWithItems } from "../types/order.type";
import {
  usePayOrder,
  useCancelOrder,
  useConvertToLayBuy,
  useRequestDispatch,
  useConfirmDispatch,
  useCancelDispatch, // 👈 new hook — see below
} from "../hooks/use-orders";
import type { Session } from "next-auth";
import type { AxiosInstance } from "axios";
import { ConfirmOrderActionDialog } from "./confirm-order-action-dialog";
import { H3 } from "@/shared/ui/typography";

export function OrderActionsCard({
  order,
  session,
  axios,
  canUpdate = false,
  storeId,
}: {
  order: OrderWithItems;
  session: Session | null;
  axios: AxiosInstance;
  canUpdate?: boolean;
  storeId: string;
}) {
  const payMut = usePayOrder(session, axios);
  const cancelMut = useCancelOrder(session, axios);
  const layBuyMut = useConvertToLayBuy(session, axios);
  const requestDispatchMut = useRequestDispatch(session, axios);
  const confirmDispatchMut = useConfirmDispatch(session, axios);
  const cancelDispatchMut = useCancelDispatch(session, axios);

  const isMutating =
    payMut.isPending ||
    cancelMut.isPending ||
    layBuyMut.isPending ||
    requestDispatchMut.isPending ||
    confirmDispatchMut.isPending ||
    cancelDispatchMut.isPending;

  const cancelError = cancelMut.isError
    ? ((cancelMut.error as any)?.response?.data?.error?.message ??
      "Unable to cancel order")
    : null;

  const canRequestDispatch =
    order.status === "paid" || order.status === "lay_buy";
  const canConfirmDispatch = order.status === "awaiting_dispatch";
  const canCancelDispatch = order.status === "awaiting_dispatch";
  const canCancel =
    order.status === "pending_payment" || order.status === "lay_buy";
  const canConvertToLayBuy =
    order.status === "pending_payment" || order.status === "draft";

  const [openRequestDispatch, setOpenRequestDispatch] = useState(false);
  const [openConfirmDispatch, setOpenConfirmDispatch] = useState(false);
  const [openCancelDispatch, setOpenCancelDispatch] = useState(false);
  const [openCancel, setOpenCancel] = useState(false);
  const [openLayBuy, setOpenLayBuy] = useState(false);

  return (
    <div className="border rounded-lg p-2">
      <div>
        <H3 className="text-lg mb-2 px-4">Actions</H3>
      </div>

      <div className="space-y-3 p-3">
        {/* Step 1 — admin/sales requests dispatch */}
        {canRequestDispatch && (
          <Button
            className="w-full"
            variant="secondary"
            disabled={!canUpdate || isMutating}
            onClick={() => setOpenRequestDispatch(true)}
          >
            Request Dispatch
          </Button>
        )}

        {/* Cancel dispatch — revert back to paid */}
        {canCancelDispatch && (
          <Button
            className="w-full"
            variant="outline"
            disabled={!canUpdate || isMutating}
            onClick={() => setOpenCancelDispatch(true)}
          >
            Cancel Dispatch Request
          </Button>
        )}

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
          open={openRequestDispatch}
          onOpenChange={setOpenRequestDispatch}
          title="Send to warehouse?"
          description="This will notify the warehouse to prepare and dispatch this order."
          confirmLabel="Yes, send to warehouse"
          isLoading={requestDispatchMut.isPending}
          error={(requestDispatchMut.error as Error)?.message}
          onConfirm={() =>
            requestDispatchMut.mutate(
              { id: order.id, storeId },
              { onSuccess: () => setOpenRequestDispatch(false) },
            )
          }
        />

        <ConfirmOrderActionDialog
          open={openConfirmDispatch}
          onOpenChange={setOpenConfirmDispatch}
          title="Confirm dispatch?"
          description="Confirm that this order has been physically packed and is leaving the warehouse. Stock will be deducted."
          confirmLabel="Yes, confirm dispatch"
          isLoading={confirmDispatchMut.isPending}
          error={(confirmDispatchMut.error as Error)?.message}
          onConfirm={() =>
            confirmDispatchMut.mutate(
              { id: order.id, storeId },
              { onSuccess: () => setOpenConfirmDispatch(false) },
            )
          }
        />

        <ConfirmOrderActionDialog
          open={openCancelDispatch}
          onOpenChange={setOpenCancelDispatch}
          title="Cancel dispatch request?"
          description="This will cancel the dispatch request and return the order to paid status."
          confirmLabel="Yes, cancel dispatch"
          isLoading={cancelDispatchMut.isPending}
          error={(cancelDispatchMut.error as Error)?.message}
          onConfirm={() =>
            cancelDispatchMut.mutate(
              { id: order.id },
              { onSuccess: () => setOpenCancelDispatch(false) },
            )
          }
        />

        <ConfirmOrderActionDialog
          open={openLayBuy}
          onOpenChange={setOpenLayBuy}
          title="Convert to lay-buy?"
          description="The order will be fulfilled now and payment collected later."
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
