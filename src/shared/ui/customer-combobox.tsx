/* eslint-disable @typescript-eslint/no-explicit-any */
// features/quotes/components/customer-combobox.tsx
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
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { useAdminCustomersOnly } from "@/features/customers/hooks/use-admin-customers";

type Props = {
  storeId: string | null;
  value: string; // customerId
  onChange: (customerId: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

export function AdminCustomerCombobox({
  storeId,
  value,
  onChange,
  placeholder = "Select a customer",
  disabled,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const { data: session } = useSession();
  const axios = useAxiosAuth();

  const { data: rows = [], isLoading } = useAdminCustomersOnly(
    {
      storeId,
      search: search || undefined,
      limit: 30,
      offset: 0,
      includeInactive: false,
    },
    session,
    axios
  );

  const options = React.useMemo(() => {
    return rows.map((c: any) => {
      const email = c.email ?? c.customerEmail ?? "";
      const name = c.fullName ?? c.name ?? c.firstName ?? "";
      const label = name ? `${name}` : email || c.id;
      return { id: c.id, label };
    });
  }, [rows]);

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
            placeholder="Search customers…"
            value={search}
            onValueChange={setSearch}
          />

          <CommandEmpty>
            {isLoading ? "Loading..." : "No customers found."}
          </CommandEmpty>

          <CommandGroup className="max-h-72 overflow-auto">
            {/* Clear selection */}
            <CommandItem
              value="__none__"
              onSelect={() => {
                onChange("");
                setOpen(false);
              }}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  value === "" ? "opacity-100" : "opacity-0"
                )}
              />
              <span className="truncate text-xs">No customer</span>
            </CommandItem>

            {options.map((opt: any) => (
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
