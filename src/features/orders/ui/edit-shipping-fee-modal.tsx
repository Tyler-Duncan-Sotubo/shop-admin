// features/orders/components/edit-shipping-fee-modal.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { toast } from "sonner";
import { useUpdateShippingFee } from "../hooks/use-update-order-customer-shipping";

type Props = {
  open: boolean;
  onClose: () => void;
  orderId: string;
  currentShipping?: string | number | null;
  currency?: string;
};

export function EditShippingFeeModal({
  open,
  onClose,
  orderId,
  currentShipping,
  currency,
}: Props) {
  const { data: session } = useSession();
  const axios = useAxiosAuth();
  const updateShipping = useUpdateShippingFee(session, axios);

  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setValue("");
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    const num = Number(value);
    if (isNaN(num) || num < 0) {
      setError("Enter a valid shipping amount");
      return;
    }

    try {
      await updateShipping.mutateAsync({ orderId, amount: num });
      toast.success("Shipping fee updated");
      handleClose();
    } catch (e) {
      setError((e as Error).message ?? "Failed to update shipping fee");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit Shipping Fee</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {currentShipping != null && (
            <div className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
              Current shipping:{" "}
              <span className="font-medium text-foreground">
                {currency ?? "NGN"} {Number(currentShipping).toLocaleString()}
              </span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>New amount ({currency ?? "NGN"})</Label>
            <Input
              type="number"
              min={0}
              value={value}
              disabled={updateShipping.isPending}
              onChange={(e) => {
                setValue(e.target.value);
                setError(null);
              }}
              placeholder="e.g. 1500"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={updateShipping.isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={updateShipping.isPending}>
            {updateShipping.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
