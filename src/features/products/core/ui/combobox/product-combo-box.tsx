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
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

type ProductOption = {
  id: string;
  label: string;
  product: {
    id: string;
    name: string;
    variants?: { id: string; title: string; price: string }[];
  };
};

type Props = {
  value: string | null; // productId
  onChange: (productId: string | null) => void;
  options: ProductOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
};

export function ProductCombobox({
  value,
  onChange,
  options,
  placeholder = "Select product",
  searchPlaceholder = "Search products…",
  disabled,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const selected = React.useMemo(
    () => options.find((o) => o.id === value),
    [options, value]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          <span className="truncate text-xs">
            {selected?.label ?? placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command>
          <CommandInput
            placeholder={searchPlaceholder}
            value={query}
            onValueChange={setQuery}
          />

          <CommandEmpty>
            <div className="p-3 text-xs text-muted-foreground">
              No products found.
            </div>
          </CommandEmpty>

          <CommandGroup className="max-h-72 overflow-auto">
            {options.map((opt) => (
              <CommandItem
                key={opt.id}
                value={opt.label}
                onSelect={() => {
                  onChange(opt.id);
                  setOpen(false);
                  setQuery("");
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === opt.id ? "opacity-100" : "opacity-0"
                  )}
                />
                <span className="truncate text-xs">{opt.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
