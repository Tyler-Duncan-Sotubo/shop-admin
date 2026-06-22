"use client";

import { useMemo, useState } from "react";
import { VariantPickerSheet, PickedItem } from "@/shared/ui/variant-picker-sheet";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import type { CreateTransferPayload } from "../hooks/use-transfers";
import { InventoryOverviewRow } from "../../core/types/inventory.type";
import { useCreateMutation } from "@/shared/hooks/use-create-mutation";

type LocationOption = {
  locationId: string;
  name: string;
  type: string;
  isPrimary?: boolean;
  isActive: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
  activeStoreId: string;
  fromLocationId: string;
  fromLocationName?: string;
  locations: LocationOption[];
  rows: InventoryOverviewRow[];
};

export function CreateTransferSheet({
  open,
  onClose,
  fromLocationId,
  fromLocationName,
  locations,
  activeStoreId,
}: Props) {
  const [toLocationId, setToLocationId] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toLocationOptions = useMemo(
    () => locations.filter((l) => l.isActive && l.locationId !== fromLocationId),
    [locations, fromLocationId],
  );

  const createTransfer = useCreateMutation<CreateTransferPayload>({
    endpoint: "/api/inventory/transfers",
    successMessage: "Transfer created",
    refetchKey: "inventory",
    onSuccess: () => setIsSubmitting(false),
    onError: () => setIsSubmitting(false),
  });

  const reset = () => {
    setToLocationId("");
    setReference("");
    setNotes("");
    setError(null);
  };

  const handleSubmit = async (items: PickedItem[]) => {
    if (!toLocationId) {
      setError("Select a destination location");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    await createTransfer(
      {
        fromLocationId,
        toLocationId,
        reference: reference.trim() || undefined,
        notes: notes.trim() || undefined,
        items: items.map((i) => ({
          productVariantId: i.variantId,
          quantity: i.quantity,
        })),
      },
      setError,
      () => {
        reset();
        onClose();
      },
    );
    setIsSubmitting(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <VariantPickerSheet
      storeId={activeStoreId}
      open={open}
      onClose={handleClose}
      title="Create transfer"
      description={`Moving stock from ${fromLocationName ?? "this location"}`}
      requireStock={false}
      isSubmitting={isSubmitting}
      submitLabel="Create transfer"
      error={error}
      onSubmit={handleSubmit}
    >
      {/* To location */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">To location</label>
        <Select value={toLocationId} onValueChange={setToLocationId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select destination" />
          </SelectTrigger>
          <SelectContent>
            {toLocationOptions.map((l) => (
              <SelectItem key={l.locationId} value={l.locationId}>
                {l.name}
                {l.type === "warehouse" ? " (Warehouse)" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reference + Notes */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Reference</label>
          <Input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="e.g. TRF-2025-0001"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Notes</label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional note…"
          />
        </div>
      </div>
    </VariantPickerSheet>
  );
}
