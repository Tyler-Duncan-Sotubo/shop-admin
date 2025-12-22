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
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreateCustomer } from "@/features/customers/hooks/use-create-customer";

type Option = { id: string; label: string; email?: string };

type Props = {
  value: string | null;
  onChange: (value: string | null) => void;
  options: Option[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;

  // optional: if you want to refetch customers after create
  onCreated?: (created: { id: string; label: string }) => void;
};

function isValidEmail(v: string) {
  // good enough for UI gating
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export function CustomerCombobox({
  value,
  onChange,
  options,
  placeholder = "Select customer (optional)",
  searchPlaceholder = "Search customers…",
  disabled,
  onCreated,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  // Keep a local list so we can append newly-created customer instantly
  const [localOptions, setLocalOptions] = React.useState<Option[]>(options);

  React.useEffect(() => {
    setLocalOptions(options);
  }, [options]);

  const { createCustomer } = useCreateCustomer();

  const selected = React.useMemo(
    () => localOptions.find((o) => o.id === value),
    [localOptions, value]
  );

  const canCreate = isValidEmail(query);

  const handleCreate = async () => {
    if (!canCreate) return;

    // you can extend this later with firstName/lastName/phone
    const res: any = await createCustomer({
      email: query.trim().toLowerCase(),
    });

    // try to be resilient to your response shape
    const created =
      res?.data?.data?.customer ?? res?.data?.customer ?? res?.customer;

    const id = created?.id as string | undefined;
    const email = created?.email as string | undefined;

    if (!id) return;

    const label =
      [created?.firstName, created?.lastName]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      email ||
      query.trim();

    const newOpt: Option = { id, label, email };

    setLocalOptions((prev) => {
      // avoid duplicates
      if (prev.some((p) => p.id === id)) return prev;
      return [newOpt, ...prev];
    });

    onChange(id);
    onCreated?.({ id, label });
    setOpen(false);
    setQuery("");
  };

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
            <div className="p-3 space-y-2">
              <p className="text-xs text-muted-foreground">
                No customers found.
              </p>

              <Button
                type="button"
                variant="secondary"
                className="w-full justify-start"
                disabled={!canCreate}
                onClick={handleCreate}
              >
                <Plus className="mr-2 h-4 w-4" />
                {canCreate
                  ? `Create "${query.trim()}"`
                  : "Type a valid email to create"}
              </Button>
            </div>
          </CommandEmpty>

          <CommandGroup className="max-h-72 overflow-auto">
            {localOptions.map((opt) => (
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
