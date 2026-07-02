"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import type { OrderWithItems } from "../types/order.type";
import {
  usePayOrder,
  useConvertToLayBuy,
  useRequestDispatch,
  useConfirmDispatch,
  useCancelDispatch,
  useCancelOrderWithRefund,
  useDeleteManualOrder,
  useFulfillOrder,
} from "../hooks/use-orders";
import type { Session } from "next-auth";
import type { AxiosInstance } from "axios";
import { ConfirmOrderActionDialog } from "./confirm-order-action-dialog";
import { H3 } from "@/shared/ui/typography";
import { useGetMySubscription } from "@/features/subscription/hooks/use-subscriptions";
import { isEnterprisePlan } from "@/features/subscription/config/plan-tier";

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
  const cancelMut = useCancelOrderWithRefund(session, axios);
  const layBuyMut = useConvertToLayBuy(session, axios);
  const requestDispatchMut = useRequestDispatch(session, axios);
  const confirmDispatchMut = useConfirmDispatch(session, axios);
  const cancelDispatchMut = useCancelDispatch(session, axios);
  const deleteMut = useDeleteManualOrder(session, axios);
  const fulfillMut = useFulfillOrder(session, axios);

  const { data: subscription } = useGetMySubscription(session, axios);
  const isCustomPlan = isEnterprisePlan(subscription?.plan.name);

  const [openDelete, setOpenDelete] = useState(false);
  const [openRequestDispatch, setOpenRequestDispatch] = useState(false);
  const [openFulfill, setOpenFulfill] = useState(false);
  const [openCancelDispatch, setOpenCancelDispatch] = useState(false);
  const [openCancel, setOpenCancel] = useState(false);
  const [openLayBuy, setOpenLayBuy] = useState(false);

  const isMutating =
    payMut.isPending ||
    cancelMut.isPending ||
    layBuyMut.isPending ||
    requestDispatchMut.isPending ||
    cancelDispatchMut.isPending ||
    fulfillMut.isPending ||
    deleteMut.isPending;

  const status = order.status;
  const isPaid = status === "paid" || status === "awaiting_dispatch";
  const isAwaitingDispatch = status === "awaiting_dispatch";
  const isLayBuy = status === "lay_buy";
  const isPendingPayment = status === "pending_payment";
  const isDraft = status === "draft";

  const canRequestDispatch = isPaid || isLayBuy;
  const canCancelDispatch = isAwaitingDispatch;
  const canConvertToLayBuy = isPendingPayment || isDraft;
  const canCancel =
    isPendingPayment || isLayBuy || isPaid || isAwaitingDispatch;
  const canDelete = isDraft;

  const cancelTitle = isPaid
    ? "Cancel & process refund?"
    : isAwaitingDispatch
      ? "Cancel order & dispatch?"
      : "Cancel this order?";

  const cancelDescription = isPaid
    ? "This order has already been paid. Cancelling it will mark it as refunded — you'll need to return the money to the customer manually outside the system."
    : isAwaitingDispatch
      ? "This will cancel the active dispatch request and the order. The warehouse will no longer need to process it."
      : isLayBuy
        ? "This will cancel the lay-buy order and release the reserved stock back to inventory."
        : "This will cancel the order and release any reserved stock back to inventory.";

  const cancelLabel = isPaid
    ? "Yes, cancel & mark as refunded"
    : "Yes, cancel order";

  return (
    <div className="border rounded-lg p-2">
      <div>
        <H3 className="text-lg mb-2 px-4">Actions</H3>
      </div>

      <div className="space-y-3 p-3">
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
            Convert to Lay-buy
          </Button>
        )}

        {canDelete && (
          <Button
            className="w-full"
            variant="destructive"
            disabled={!canUpdate || isMutating}
            onClick={() => setOpenDelete(true)}
          >
            Delete Order
          </Button>
        )}

        {canRequestDispatch && !isAwaitingDispatch && isCustomPlan && (
          <Button
            className="w-full"
            variant="secondary"
            disabled={!canUpdate || isMutating}
            onClick={() => setOpenRequestDispatch(true)}
          >
            Request Dispatch
          </Button>
        )}

        {canRequestDispatch && !isAwaitingDispatch && !isCustomPlan && (
          <Button
            className="w-full"
            variant="secondary"
            disabled={!canUpdate || isMutating}
            onClick={() => setOpenFulfill(true)}
          >
            Fulfill Order
          </Button>
        )}

        {canCancel && (
          <Button
            className="w-full"
            variant="destructive"
            disabled={!canUpdate || isMutating}
            onClick={() => setOpenCancel(true)}
          >
            {isPaid ? "Cancel & Refund" : "Cancel Order"}
          </Button>
        )}

        <p className="text-xs text-muted-foreground">
          All actions require confirmation to prevent mistakes.
        </p>
      </div>

      {/* ── Dialogs ── */}

      <ConfirmOrderActionDialog
        open={openFulfill}
        onOpenChange={setOpenFulfill}
        title="Fulfill this order?"
        description="Stock will be deducted from inventory and the order will be marked as fulfilled."
        confirmLabel="Yes, fulfill order"
        isLoading={fulfillMut.isPending}
        error={(fulfillMut.error as Error)?.message}
        onConfirm={() =>
          fulfillMut.mutate(order.id, {
            onSuccess: () => setOpenFulfill(false),
          })
        }
      />

      <ConfirmOrderActionDialog
        open={openRequestDispatch}
        onOpenChange={setOpenRequestDispatch}
        title="Send to warehouse?"
        description="The warehouse team will be notified to pack and dispatch this order. You can cancel the request if needed before they confirm it."
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
        open={openCancelDispatch}
        onOpenChange={setOpenCancelDispatch}
        title="Cancel dispatch request?"
        description="The warehouse will no longer process this order for dispatch. The order will return to its previous status and can be re-dispatched later."
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
        description="The customer will receive their items now and pay later. This is useful when a customer needs the goods before payment is complete."
        confirmLabel="Yes, convert to lay-buy"
        isLoading={layBuyMut.isPending}
        onConfirm={() =>
          layBuyMut.mutate(order.id, {
            onSuccess: () => setOpenLayBuy(false),
          })
        }
      />

      <ConfirmOrderActionDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        title="Delete this order?"
        description="This draft order will be permanently deleted and cannot be recovered. No stock or payments are affected."
        confirmLabel="Yes, delete order"
        confirmVariant="destructive"
        requireText={order.orderNumber}
        isLoading={deleteMut.isPending}
        error={(deleteMut.error as Error)?.message}
        onConfirm={() =>
          deleteMut.mutate(order.id, {
            onSuccess: () => setOpenDelete(false),
          })
        }
      />

      <ConfirmOrderActionDialog
        open={openCancel}
        onOpenChange={(open) => {
          console.log("isPaid:", isPaid, "status:", order.status);

          setOpenCancel(open);
          if (!open) cancelMut.reset();
        }}
        title={cancelTitle}
        description={cancelDescription}
        confirmLabel={cancelLabel}
        confirmVariant="destructive"
        requireText={order.orderNumber}
        isLoading={cancelMut.isPending}
        error={
          cancelMut.isError
            ? ((cancelMut.error as Error)?.message ?? "Unable to cancel order")
            : null
        }
        onConfirm={() =>
          cancelMut.mutate(
            {
              orderId: order.id,
              forceRefund: isPaid,
              refundNote: isPaid ? "Cancelled by admin" : undefined,
            },
            {
              onSuccess: () => {
                setOpenCancel(false);
                cancelMut.reset();
              },
            },
          )
        }
      />
    </div>
  );
}
