/* eslint-disable @typescript-eslint/no-explicit-any */
// features/inventory/dispatches/ui/dispatch-row-actions.tsx
"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import {
  useConfirmDispatch,
  type DispatchListItem,
} from "../hooks/use-dispatches";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { ConfirmOrderActionDialog } from "@/features/orders/ui/confirm-order-action-dialog";
import { toast } from "sonner";

export function DispatchRowActions({
  dispatch,
}: {
  dispatch: DispatchListItem;
}) {
  const axios = useAxiosAuth();
  const confirmMut = useConfirmDispatch(axios);
  const [open, setOpen] = useState(false);

  if (dispatch.status !== "pending") return null;

  return (
    <>
      <Button
        size="sm"
        onClick={() => setOpen(true)}
        disabled={confirmMut.isPending}
      >
        Confirm Dispatch
      </Button>

      <ConfirmOrderActionDialog
        open={open}
        onOpenChange={setOpen}
        title="Confirm dispatch?"
        description="Confirm this order has been packed and is leaving the warehouse. Stock will be deducted."
        confirmLabel="Yes, confirm dispatch"
        isLoading={confirmMut.isPending}
        error={
          (confirmMut.error as any)?.response?.data?.error?.message ??
          (confirmMut.error as Error)?.message
        }
        onConfirm={() =>
          confirmMut.mutate(
            { orderId: dispatch.orderId, storeId: dispatch.storeId },
            {
              onSuccess: () => {
                setOpen(false);
                toast.success("Dispatch confirmed");
              },
              onError: (err: any) => {
                const message =
                  err?.response?.data?.error?.message ??
                  err?.message ??
                  "Failed to confirm dispatch";
                toast.error(message);
              },
            },
          )
        }
      />
    </>
  );
}
