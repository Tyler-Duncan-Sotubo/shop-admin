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
import Image from "next/image";

type VariantOption = {
  id: string;
  label: string;
  imageSrc?: string;
};

type Props = {
  value: string | null;
  onChange: (value: string | null) => void;
  options: VariantOption[];
  placeholder?: string;
  disabled?: boolean;
};

export function VariantCombobox({
  value,
  onChange,
  options,
  placeholder = "Select variation",
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
          <span className="truncate text-xs flex items-center gap-2">
            {selected?.imageSrc ? (
              <Image
                src={selected.imageSrc}
                alt=""
                className="h-5 w-5 rounded object-cover"
                width={20}
                height={20}
              />
            ) : null}
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
            placeholder="Search variations…"
            value={query}
            onValueChange={setQuery}
          />

          <CommandEmpty>
            <div className="p-3 text-xs text-muted-foreground">
              No variations found.
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
                className="flex items-center gap-2"
              >
                <Check
                  className={cn(
                    "h-4 w-4",
                    value === opt.id ? "opacity-100" : "opacity-0"
                  )}
                />

                {opt.imageSrc ? (
                  <Image
                    src={opt.imageSrc}
                    alt=""
                    className="h-8 w-8 rounded object-cover border"
                    width={32}
                    height={32}
                  />
                ) : (
                  <div className="h-8 w-8 rounded bg-muted" />
                )}

                <span className="truncate text-xs">{opt.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
