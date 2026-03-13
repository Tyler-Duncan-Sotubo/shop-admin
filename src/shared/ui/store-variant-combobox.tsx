/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { Button } from "@/shared/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/shared/ui/command";
import { Check, ChevronsUpDown, Package, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVariantSearch } from "../hooks/use-variant-search";
import { Badge } from "@/shared/ui/badge";

type Props = {
  storeId: string | null;
  value: string;
  onChange: (variantId: string, unitPriceSuggestion?: number | null) => void;
  placeholder?: string;
  disabled?: boolean;
  requireStock?: boolean;
};

export function StoreVariantCombobox({
  storeId,
  value,
  onChange,
  placeholder = "Select a variant",
  disabled,
  requireStock = true,
}: Props) {
  const [open, setOpen] = React.useState(false);

  const { options, isLoading, search, setSearch } = useVariantSearch(
    storeId,
    requireStock,
  );

  const selected = React.useMemo(
    () => options.find((o) => o.id === value),
    [options, value],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-9"
          disabled={disabled || !storeId}
        >
          {selected ? (
            <div className="flex items-center gap-2 min-w-0">
              <Package className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate text-xs font-medium">
                {selected.productName ?? "Product"} —{" "}
                <span className="text-muted-foreground font-normal">
                  {selected.title}
                </span>
              </span>
              {!requireStock && (
                <Badge
                  variant={
                    (selected as any).available > 0
                      ? "secondary"
                      : "destructive"
                  }
                  className="ml-auto shrink-0 text-[10px] px-1.5 py-0"
                >
                  {(selected as any).available > 0
                    ? `${(selected as any).available} in stock`
                    : "Out of stock"}
                </Badge>
              )}
            </div>
          ) : (
            <span className="truncate text-xs text-muted-foreground">
              {placeholder}
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search by name or SKU…"
            value={search}
            onValueChange={setSearch}
            className="text-xs"
          />

          <CommandEmpty className="py-6 text-center">
            {isLoading ? (
              <span className="text-xs text-muted-foreground">Searching…</span>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <Package className="h-6 w-6 text-muted-foreground/40" />
                <span className="text-xs text-muted-foreground">
                  No variants found
                </span>
              </div>
            )}
          </CommandEmpty>

          <CommandGroup className="max-h-72 overflow-auto p-1">
            {options.map((opt: any) => {
              const isSelected = value === opt.id;
              const outOfStock = !requireStock && opt.available === 0;

              return (
                <CommandItem
                  key={opt.id}
                  value={`${opt.productName ?? ""} ${opt.title ?? ""} ${opt.sku ?? ""}`}
                  onSelect={() => {
                    onChange(opt.id, opt.suggestedUnitPrice ?? null);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-2 cursor-pointer",
                    isSelected && "bg-accent",
                  )}
                >
                  <Check
                    className={cn(
                      "h-3.5 w-3.5 shrink-0",
                      isSelected ? "opacity-100 text-primary" : "opacity-0",
                    )}
                  />

                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="truncate text-xs font-medium">
                        {opt.productName ?? "Product"}
                      </span>
                      <span className="text-muted-foreground text-xs shrink-0">
                        — {opt.title}
                      </span>
                    </div>
                    {opt.sku && (
                      <span className="text-[10px] text-muted-foreground/70">
                        SKU: {opt.sku}
                      </span>
                    )}
                  </div>

                  {!requireStock && (
                    <div className="shrink-0 flex items-center gap-1">
                      {outOfStock ? (
                        <span className="flex items-center gap-0.5 text-[10px] text-destructive font-medium">
                          <AlertCircle className="h-3 w-3" />
                          Out of stock
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">
                          {opt.available} in stock
                        </span>
                      )}
                    </div>
                  )}
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
