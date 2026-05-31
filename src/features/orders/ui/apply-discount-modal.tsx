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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { useApplyDiscount, useRemoveDiscount } from "../hooks/use-orders";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onClose: () => void;
  orderId: string;
  subtotal: string | number;
  currency?: string;
  currentDiscount?: string | number | null;
};

export function ApplyDiscountModal({
  open,
  onClose,
  orderId,
  subtotal,
  currency,
  currentDiscount,
}: Props) {
  const { data: session } = useSession();
  const axios = useAxiosAuth();
  const applyDiscount = useApplyDiscount(session, axios);
  const removeDiscount = useRemoveDiscount(session, axios);

  const [type, setType] = useState<"flat" | "percent">("percent");
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const hasDiscount = Number(currentDiscount ?? 0) > 0;
  const isBusy = applyDiscount.isPending || removeDiscount.isPending;

  const handleClose = () => {
    setValue("");
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    const num = Number(value);
    if (!num || num <= 0) {
      setError("Enter a valid discount value");
      return;
    }
    if (type === "percent" && num > 100) {
      setError("Percentage cannot exceed 100");
      return;
    }

    try {
      await applyDiscount.mutateAsync({ orderId, type, value: num });
      toast.success("Discount applied");
      handleClose();
    } catch (e) {
      setError((e as Error).message ?? "Failed to apply discount");
    }
  };

  const handleRemove = async () => {
    try {
      await removeDiscount.mutateAsync(orderId);
      toast.success("Discount removed");
      handleClose();
    } catch (e) {
      setError((e as Error).message ?? "Failed to remove discount");
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
          <DialogTitle>
            {hasDiscount ? "Update Discount" : "Apply Discount"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {hasDiscount && (
            <div className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
              Current discount:{" "}
              <span className="font-medium text-foreground">
                {currency ?? "NGN"} {Number(currentDiscount).toLocaleString()}
              </span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Discount type</Label>
            <Select
              value={type}
              onValueChange={(v) => setType(v as "flat" | "percent")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percent">Percentage (%)</SelectItem>
                <SelectItem value="flat">
                  Flat amount ({currency ?? "NGN"})
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>{type === "percent" ? "Percentage" : "Amount"}</Label>
            <Input
              type="number"
              min={0}
              max={type === "percent" ? 100 : undefined}
              value={value}
              disabled={isBusy}
              onChange={(e) => {
                setValue(e.target.value);
                setError(null);
              }}
              placeholder={type === "percent" ? "e.g. 10" : "e.g. 5000"}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <div className="flex justify-between gap-2">
          {hasDiscount && (
            <Button
              variant="ghost"
              className="text-destructive hover:text-destructive"
              disabled={isBusy}
              onClick={handleRemove}
            >
              {removeDiscount.isPending ? "Removing..." : "Remove discount"}
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={handleClose} disabled={isBusy}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isBusy}>
              {applyDiscount.isPending ? "Applying..." : "Apply"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
