// features/orders/components/edit-order-item-price-modal.tsx
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
import { useUpdateOrderItem, useUpdateOrderItemQty } from "../hooks/use-orders";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { toast } from "sonner";
import { formatMoneyNGN } from "@/shared/utils/format-to-naira";

type Props = {
  open: boolean;
  onClose: () => void;
  orderId: string;
  itemId: string;
  itemName: string;
  currentUnitPrice: string | number;
  currency?: string;
};

export function EditOrderItemPriceModal({
  open,
  onClose,
  orderId,
  itemId,
  itemName,
  currentUnitPrice,
  currency,
}: Props) {
  const { data: session } = useSession();
  const axios = useAxiosAuth();
  const updateItem = useUpdateOrderItem(session, axios);

  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const originalPrice = Number(currentUnitPrice ?? 0);
  const newPrice = Number(value);
  const hasChange =
    value !== "" && !isNaN(newPrice) && newPrice !== originalPrice;
  const saving = hasChange && newPrice < originalPrice;
  const savingAmount = saving ? originalPrice - newPrice : 0;

  const handleClose = () => {
    setValue("");
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    const num = Number(value);
    if (isNaN(num) || num < 0) {
      setError("Enter a valid price");
      return;
    }

    try {
      await updateItem.mutateAsync({
        orderId,
        itemId,
        unitPrice: num,
      });
      toast.success("Price updated");
      handleClose();
    } catch (e) {
      setError((e as Error).message ?? "Failed to update price");
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
          <DialogTitle>Edit Item Price</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Item name */}
          <div className="rounded-md bg-muted px-3 py-2 text-sm">
            <span className="text-muted-foreground">Item: </span>
            <span className="font-medium">{itemName}</span>
          </div>

          {/* Original price */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Original price</span>
            <span className="font-medium">
              {formatMoneyNGN(originalPrice, currency ?? "NGN")}
            </span>
          </div>

          {/* New price input */}
          <div className="space-y-1.5">
            <Label>New price ({currency ?? "NGN"})</Label>
            <Input
              type="number"
              min={0}
              value={value}
              disabled={updateItem.isPending}
              onChange={(e) => {
                setValue(e.target.value);
                setError(null);
              }}
              placeholder={`e.g. ${originalPrice}`}
            />
          </div>

          {/* Preview */}
          {hasChange && (
            <div className="rounded-md border px-3 py-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Was</span>
                <span className="line-through text-muted-foreground">
                  {formatMoneyNGN(originalPrice, currency ?? "NGN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Now</span>
                <span
                  className={`font-medium ${saving ? "text-emerald-600" : "text-amber-600"}`}
                >
                  {formatMoneyNGN(newPrice, currency ?? "NGN")}
                </span>
              </div>
              {saving && (
                <div className="flex justify-between border-t pt-1 mt-1">
                  <span className="text-muted-foreground">Customer saves</span>
                  <span className="font-medium text-emerald-600">
                    {formatMoneyNGN(savingAmount, currency ?? "NGN")}
                  </span>
                </div>
              )}
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={updateItem.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={updateItem.isPending || !hasChange}
          >
            {updateItem.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
