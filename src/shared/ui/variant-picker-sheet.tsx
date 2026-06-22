"use client";

import { ReactNode, useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/shared/ui/sheet";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Button } from "@/shared/ui/button";
import { useVariantSearch } from "@/shared/hooks/use-variant-search";
import { Search, Package, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export type PickedItem = {
  variantId: string;
  quantity: number;
};

type SelectedMeta = {
  quantity: number;
  productName: string | null;
  title: string;
  sku: string | null;
  imageUrl: string | null;
  available: number;
};

type Props = {
  storeId: string | null;
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  requireStock?: boolean;
  isSubmitting?: boolean;
  submitLabel?: string;
  /** External validation error (e.g. "select a destination location") */
  error?: string | null;
  onSubmit: (items: PickedItem[]) => void;
  /** Extra fields rendered between the header and the search bar (e.g. To/Reference/Notes for transfers) */
  children?: ReactNode;
};

export function VariantPickerSheet({
  storeId,
  open,
  onClose,
  title,
  description,
  requireStock = false,
  isSubmitting,
  submitLabel = "Add items",
  error: externalError,
  onSubmit,
  children,
}: Props) {
  const [selected, setSelected] = useState<Record<string, SelectedMeta>>({});
  const [internalError, setInternalError] = useState<string | null>(null);

  const { options, isLoading, search, setSearch } = useVariantSearch(
    storeId,
    requireStock,
  );

  const selectedIds = Object.keys(selected);
  const totalQty = Object.values(selected).reduce((s, v) => s + v.quantity, 0);
  const displayError = externalError ?? internalError;

  const toggle = (v: (typeof options)[0]) => {
    setInternalError(null);
    setSelected((prev) => {
      if (prev[v.id]) {
        const next = { ...prev };
        delete next[v.id];
        return next;
      }
      return {
        ...prev,
        [v.id]: {
          quantity: 1,
          productName: v.productName,
          title: v.title,
          sku: v.sku,
          imageUrl: v.imageUrl,
          available: v.available,
        },
      };
    });
  };

  const setQty = (variantId: string, qty: number) => {
    if (qty <= 0) {
      setSelected((prev) => {
        const next = { ...prev };
        delete next[variantId];
        return next;
      });
      return;
    }
    setSelected((prev) => ({
      ...prev,
      [variantId]: { ...prev[variantId], quantity: qty },
    }));
  };

  const reset = () => {
    setSelected({});
    setSearch("");
    setInternalError(null);
  };

  useEffect(() => {
    if (!open) reset();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      reset();
      onClose();
    }
  };

  const handleSubmit = () => {
    if (selectedIds.length === 0) {
      setInternalError("Select at least one item");
      return;
    }
    setInternalError(null);
    onSubmit(
      selectedIds.map((variantId) => ({
        variantId,
        quantity: selected[variantId].quantity,
      })),
    );
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="flex flex-col h-full p-0 gap-0 w-full sm:max-w-[550px] bg-white">
        {/* Header */}
        <SheetHeader className="px-4 pt-6 pb-4 border-b shrink-0">
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>

        {/* Extra fields slot (e.g. To location, Reference for transfers) */}
        {children && (
          <div className="px-4 py-4 border-b shrink-0 space-y-4">
            {children}
          </div>
        )}

        {/* Search */}
        <div className="px-4 py-3 border-b shrink-0">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or SKU…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 h-10 rounded-md border border-input bg-muted text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        {/* Variant list */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-4 space-y-2">
            {isLoading ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Searching…
              </p>
            ) : options.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-14">
                <Package className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  {search ? "No variants found" : "Search to find variants"}
                </p>
              </div>
            ) : (
              options.map((v) => {
                const isSelected = !!selected[v.id];
                const qty = selected[v.id]?.quantity ?? 0;
                const outOfStock = v.available === 0;

                return (
                  <div
                    key={v.id}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border p-3 transition-colors",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border bg-muted/30",
                    )}
                  >
                    {/* Thumbnail */}
                    <button
                      type="button"
                      onClick={() => toggle(v)}
                      className="h-11 w-11 shrink-0 overflow-hidden rounded-md border bg-background flex items-center justify-center"
                    >
                      {v.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={v.imageUrl}
                          alt={v.productName ?? ""}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package className="h-5 w-5 text-muted-foreground/30" />
                      )}
                    </button>

                    {/* Info */}
                    <button
                      type="button"
                      onClick={() => toggle(v)}
                      className="flex-1 min-w-0 text-left"
                    >
                      <p className="text-sm font-medium leading-tight truncate">
                        {v.productName ?? "Product"}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground truncate">
                        {v.title}
                        {v.sku ? ` · ${v.sku}` : ""}
                      </p>
                      <p
                        className={cn(
                          "mt-0.5 text-xs",
                          outOfStock
                            ? "text-destructive"
                            : "text-muted-foreground",
                        )}
                      >
                        {outOfStock
                          ? "Out of stock"
                          : `${v.available} in stock`}
                      </p>
                    </button>

                    {/* Qty stepper when selected, circle when not */}
                    {isSelected ? (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setQty(v.id, qty - 1)}
                          className="h-7 w-7 rounded-md border flex items-center justify-center hover:bg-muted transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium tabular-nums">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQty(v.id, qty + 1)}
                          className="h-7 w-7 rounded-md border flex items-center justify-center hover:bg-muted transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggle(v)}
                        className="h-5 w-5 shrink-0 rounded-full border-2 border-border"
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <SheetFooter className="px-4 py-4 border-t shrink-0 flex-row items-center gap-2">
          {displayError ? (
            <p className="flex-1 text-xs text-destructive">{displayError}</p>
          ) : selectedIds.length > 0 ? (
            <p className="flex-1 text-xs text-muted-foreground">
              {selectedIds.length} variant{selectedIds.length !== 1 ? "s" : ""}{" "}
              · {totalQty} unit{totalQty !== 1 ? "s" : ""}
            </p>
          ) : (
            <div className="flex-1" />
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="clean"
              onClick={() => {
                reset();
                onClose();
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              disabled={selectedIds.length === 0 || isSubmitting}
            >
              {selectedIds.length > 0
                ? `${submitLabel} (${selectedIds.length})`
                : submitLabel}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
