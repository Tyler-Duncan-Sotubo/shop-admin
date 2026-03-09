"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { AdminCustomerCombobox } from "@/shared/ui/customer-combobox";
import { useUpdateOrderCustomerShipping } from "../hooks/use-update-order-customer-shipping";

type Props = {
  open: boolean;
  onClose: () => void;
  orderId: string;
  storeId: string | null;
  initialCustomerId?: string;
};

export function EditOrderCustomerShippingModal({
  open,
  onClose,
  orderId,
  storeId,
  initialCustomerId = "",
}: Props) {
  const { data: session } = useSession();
  const axios = useAxiosAuth();

  const [customerId, setCustomerId] = React.useState(initialCustomerId);

  const updateCustomerShipping = useUpdateOrderCustomerShipping(session, axios);

  React.useEffect(() => {
    if (open) {
      setCustomerId(initialCustomerId ?? "");
    }
  }, [open, initialCustomerId]);

  const handleContinue = async () => {
    if (!customerId) return;

    await updateCustomerShipping.mutateAsync({
      orderId,
      customerId,
    });

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit customer & shipping</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Customer</Label>
            <AdminCustomerCombobox
              storeId={storeId}
              value={customerId}
              onChange={setCustomerId}
              placeholder="Select customer"
              disabled={updateCustomerShipping.isPending}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={updateCustomerShipping.isPending}
          >
            Cancel
          </Button>

          <Button
            type="button"
            disabled={!customerId || updateCustomerShipping.isPending}
            onClick={handleContinue}
          >
            {updateCustomerShipping.isPending ? "Saving..." : "Continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
