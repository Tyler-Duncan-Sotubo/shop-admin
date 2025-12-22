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

type Option = { id: string; label: string };

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
};

export function VariantCombobox({
  value,
  onChange,
  options,
  placeholder = "Select a variant",
  searchPlaceholder = "Search variants…",
  disabled,
}: Props) {
  const [open, setOpen] = React.useState(false);

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
          <CommandInput placeholder={searchPlaceholder} />
          <CommandEmpty>No variants found.</CommandEmpty>

          <CommandGroup className="max-h-72 overflow-auto">
            {options.map((opt) => (
              <CommandItem
                key={opt.id}
                value={opt.label}
                onSelect={() => {
                  onChange(opt.id);
                  setOpen(false);
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
