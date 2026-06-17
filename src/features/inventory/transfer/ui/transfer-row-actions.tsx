// src/modules/transfer/ui/transfer-status-action.tsx
"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import type { TransferListItem } from "../types/transfer.type";
import { UpdateTransferStatusModal } from "./update-transfer-status-modal";

import { useRouter } from "next/navigation";
import { FaEdit } from "react-icons/fa";

export function TransferStatusActions({
  transfer,
}: {
  transfer: TransferListItem;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const isPending = transfer.status === "pending";

  return (
    <div className="flex gap-2">
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

      {isPending && (
        <Button
          size="sm"
          variant="clean"
          onClick={(e) => {
            e.stopPropagation?.();
            router.push(`/inventory/transfers/${transfer.id}/edit`);
          }}
        >
          <FaEdit className="w-4 h-4 mr-1" /> Edit items
        </Button>
      )}

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
    </div>
  );
}
