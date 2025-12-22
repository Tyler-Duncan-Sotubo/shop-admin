"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import type { InventoryOverviewRow } from "../types/inventory.type";
import { AdjustInventoryModal } from "./adjust-inventory-modal";

type Props = {
  row: InventoryOverviewRow;
  locationId: string;
};

export function InventoryAdjustAction({ row, locationId }: Props) {
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
      >
        Adjust
      </Button>

      <AdjustInventoryModal
        open={open}
        onClose={() => setOpen(false)}
        productVariantId={row.variantId}
        locationId={locationId}
        productName={row.productName}
        variantTitle={row.variantTitle}
        sku={row.sku}
        currentOnHand={row.onHand}
      />
    </>
  );
}
