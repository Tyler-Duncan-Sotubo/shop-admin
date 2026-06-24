/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import {
  useConfirmDispatch,
  type DispatchListItem,
} from "../hooks/use-dispatches";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { ConfirmDispatchSheet } from "./confirm-dispatch-sheet";
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

  const error =
    (confirmMut.error as any)?.response?.data?.error?.message ??
    (confirmMut.error as Error)?.message ??
    null;

  return (
    <>
      <Button
        size="sm"
        onClick={() => setOpen(true)}
        disabled={confirmMut.isPending}
      >
        Confirm Dispatch
      </Button>

      <ConfirmDispatchSheet
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) confirmMut.reset();
        }}
        isLoading={confirmMut.isPending}
        error={error}
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
                if (message.includes(" | ")) {
                  toast.error("Not enough stock — see details in panel");
                  return;
                }
                toast.error(message);
              },
            },
          )
        }
      />
    </>
  );
}
