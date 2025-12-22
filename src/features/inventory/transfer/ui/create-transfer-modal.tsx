"use client";

import { FormEvent, useMemo, useState } from "react";
import { FormModal } from "@/shared/ui/form-modal";
import { Button } from "@/shared/ui/button";
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
import { VariantCombobox } from "../../core/ui/variant-combo-box";
import { useCreateMutation } from "@/shared/hooks/use-create-mutation";

type LocationOption = {
  locationId: string;
  name: string;
  type: string; // warehouse | retail
  isPrimary?: boolean;
  isActive: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;

  fromLocationId: string;
  fromLocationName?: string;

  // all locations for this store (for the "to" dropdown)
  locations: LocationOption[];

  // inventory rows from current overview (to pick variants to transfer)
  rows: InventoryOverviewRow[];
};

type Line = { productVariantId: string; quantity: number };

export function CreateTransferModal({
  open,
  onClose,
  fromLocationId,
  fromLocationName,
  locations,
  rows,
}: Props) {
  const [toLocationId, setToLocationId] = useState<string>("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const createTransfer = useCreateMutation<CreateTransferPayload>({
    endpoint: "/api/inventory/transfers",
    successMessage: "Transfer created successfully",
    refetchKey: "inventory", // ✅ pick a key that matches your queries
    onSuccess: () => {
      setSubmitError(null);
      setIsSubmitting(false);
      setToLocationId("");
      setReference("");
      setNotes("");
      setLines([{ productVariantId: "", quantity: 1 }]);
      onClose();
    },
    onError: () => {
      setIsSubmitting(false);
    },
  });

  const [lines, setLines] = useState<Line[]>([
    { productVariantId: "", quantity: 1 },
  ]);

  const toLocationOptions = useMemo(
    () =>
      locations.filter((l) => l.isActive && l.locationId !== fromLocationId),
    [locations, fromLocationId]
  );

  const variantOptions = useMemo(() => {
    // Only show variants that exist in the overview rows
    // label = Product • Variant • SKU
    return rows.map((r) => ({
      id: r.variantId,
      label: `${r.productName} • ${r.variantTitle ?? "Default"}`,
    }));
  }, [rows]);

  const setLine = (idx: number, patch: Partial<Line>) => {
    setLines((prev) =>
      prev.map((l, i) => (i === idx ? { ...l, ...patch } : l))
    );
  };

  const addLine = () =>
    setLines((prev) => [...prev, { productVariantId: "", quantity: 1 }]);

  const removeLine = (idx: number) =>
    setLines((prev) => prev.filter((_, i) => i !== idx));

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // basic validation
    if (!toLocationId) return;

    const cleaned = lines
      .filter((l) => l.productVariantId && Number(l.quantity) > 0)
      .map((l) => ({
        productVariantId: l.productVariantId,
        quantity: Number(l.quantity),
      }));

    if (cleaned.length === 0) return;
    setIsSubmitting(true);
    await createTransfer(
      {
        fromLocationId,
        toLocationId,
        reference: reference.trim() || undefined,
        notes: notes.trim() || undefined,
        items: cleaned,
      },
      setSubmitError,
      onClose
    );
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      mode="create"
      title="Create transfer"
      description={`Move stock from ${
        fromLocationName ?? "this location"
      } to another location.`}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Create transfer"
    >
      {/* From */}
      <div className="space-y-1">
        <div className="text-sm text-muted-foreground">From</div>
        <div className="text-sm font-medium">
          {fromLocationName ?? fromLocationId}
        </div>
      </div>

      {/* To */}
      <div className="space-y-2">
        <div className="text-sm">To location</div>
        <Select value={toLocationId} onValueChange={setToLocationId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select destination location" />
          </SelectTrigger>
          <SelectContent>
            {toLocationOptions.map((l) => (
              <SelectItem key={l.locationId} value={l.locationId}>
                {l.name} {l.type === "warehouse" ? "(Warehouse)" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reference + Notes */}
      <div className="grid grid-cols-1 gap-3">
        <div className="space-y-2">
          <div className="text-sm">Reference (optional)</div>
          <Input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="e.g. TRF-2025-0001"
          />
        </div>

        <div className="space-y-2">
          <div className="text-sm">Notes (optional)</div>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything to note for this transfer…"
          />
        </div>
      </div>

      {/* Items */}
      <div className="space-y-2">
        <div className="text-sm font-medium">Items</div>

        <div className="space-y-3">
          {lines.map((line, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end"
            >
              <div className="md:col-span-8 space-y-2">
                <div className="text-xs text-muted-foreground">Variant</div>
                <VariantCombobox
                  value={line.productVariantId}
                  onChange={(v) => setLine(idx, { productVariantId: v })}
                  options={variantOptions}
                />
              </div>

              <div className="md:col-span-3 space-y-2">
                <div className="text-xs text-muted-foreground">Qty</div>
                <Input
                  type="number"
                  min={1}
                  value={line.quantity}
                  onChange={(e) =>
                    setLine(idx, { quantity: Number(e.target.value) })
                  }
                  className="w-16"
                />
              </div>

              <div className="md:col-span-1 flex justify-end">
                {lines.length > 1 ? (
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => removeLine(idx)}
                    className="p-0 text-red-500"
                  >
                    Remove
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="clean"
          onClick={addLine}
          className="h-10"
        >
          + Add item
        </Button>
      </div>

      {submitError ? (
        <div className="text-sm text-red-600">{submitError}</div>
      ) : null}
    </FormModal>
  );
}
