// src/modules/transfer/ui/transfer-status-action.tsx
"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import type { TransferListItem } from "../types/transfer.type";
import { UpdateTransferStatusModal } from "./update-transfer-status-modal";

export function TransferStatusActions({
  transfer,
}: {
  transfer: TransferListItem;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        size="sm"
        variant="clean"
        onClick={(e) => {
          e.stopPropagation?.();
          setOpen(true);
        }}
        disabled={
          transfer.status === "completed" || transfer.status === "cancelled"
        }
      >
        Update status
      </Button>

      <UpdateTransferStatusModal
        open={open}
        onClose={() => setOpen(false)}
        transferId={transfer.id}
        currentStatus={
          transfer.status as
            | "pending"
            | "in_transit"
            | "completed"
            | "cancelled"
        }
        fromLocationName={transfer.fromLocationName}
        toLocationName={transfer.toLocationName}
      />
    </>
  );
}
