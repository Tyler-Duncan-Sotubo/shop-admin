"use client";

import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Badge } from "@/shared/ui/badge";
import { formatMoneyNGN } from "@/shared/utils/format-to-naira";
import { useGetDispatch } from "../hooks/use-dispatches";
import Loading from "@/shared/ui/loading";

type Props = {
  open: boolean;
  onClose: () => void;
  orderId: string | null;
  orderNumber?: string | null;
};

export function DispatchItemsModal({
  open,
  onClose,
  orderId,
  orderNumber,
}: Props) {
  const { data: session } = useSession();
  const axios = useAxiosAuth();

  const { data: dispatch, isLoading } = useGetDispatch(
    open ? orderId : null,
    session,
    axios,
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="max-w-sm flex flex-col max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-base">
            {orderNumber ?? "Order Items"}
          </DialogTitle>

          {/* ✅ compact meta row right under the title */}
          {dispatch && !isLoading && (
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <Badge
                variant={
                  dispatch.status === "dispatched"
                    ? "default"
                    : dispatch.status === "cancelled"
                      ? "destructive"
                      : "secondary"
                }
                className="text-xs"
              >
                {dispatch.status}
              </Badge>
              {dispatch.customerName && (
                <span className="text-xs text-muted-foreground">
                  {dispatch.customerName}
                </span>
              )}
              {dispatch.total && (
                <span className="text-xs text-muted-foreground ml-auto">
                  {formatMoneyNGN(
                    Number(dispatch.total),
                    dispatch.currency ?? "NGN",
                  )}
                </span>
              )}
            </div>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          {isLoading ? (
            <Loading />
          ) : !dispatch ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No dispatch data found.
            </div>
          ) : !dispatch.items?.length ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No items found.
            </div>
          ) : (
            <div className="divide-y border rounded-lg ">
              {dispatch.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-medium truncate">
                      {item.name}
                    </div>
                    {item.sku && (
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {item.sku}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0 space-y-0.5">
                    <div className="text-xs font-semibold">
                      ×{item.quantity}
                    </div>
                    {item.unitPrice && (
                      <div className="text-[10px] text-muted-foreground">
                        {formatMoneyNGN(
                          Number(item.unitPrice),
                          dispatch.currency ?? "NGN",
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {dispatch?.note && (
            <p className="mt-3 text-xs text-muted-foreground px-1">
              {dispatch.note}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
