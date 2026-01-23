"use client";

import * as React from "react";
import Image from "next/image";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { cn } from "@/lib/utils";

export type StoreSelectItem = {
  id: string;
  name: string;
  imageUrl?: string | null;
  imageAltText?: string | null;
};

type StoreSwitcherProps = {
  stores: StoreSelectItem[];
  value: string | null;
  onChange: (storeId: string) => void;
  placeholder?: string;
  className?: string;
};

export function StoreSwitcher({
  stores,
  value,
  onChange,
  placeholder = "Choose a store",
  className,
}: StoreSwitcherProps) {
  const [open, setOpen] = React.useState(false);

  const active = React.useMemo(
    () => (value ? stores.find((s) => s.id === value) : undefined),
    [stores, value],
  );

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="text-xs text-muted-foreground hidden md:block">
        Active store
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            // variant="primary"
            className="h-10 w-[220px] justify-between px-3 "
          >
            <div className="flex items-center gap-3 min-w-0">
              {active?.imageUrl ? (
                <Image
                  src={active.imageUrl}
                  alt={active.imageAltText || active.name}
                  width={28}
                  height={28}
                  className="rounded-md object-cover"
                />
              ) : (
                <div className="h-7 w-7 rounded-md bg-muted" />
              )}

              <div className="min-w-0 text-left">
                <div className="font-extrabold truncate">
                  {active?.name ?? placeholder}
                </div>
              </div>
            </div>

            <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </PopoverTrigger>

        <PopoverContent align="start" className="w-[220px] p-2">
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
            Select a store
          </div>

          <div className="max-h-60 overflow-auto">
            {stores.map((store) => {
              const selected = store.id === value;
              return (
                <button
                  key={store.id}
                  type="button"
                  onClick={() => {
                    onChange(store.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-muted/60",
                    selected && "bg-muted/60",
                  )}
                >
                  {store.imageUrl ? (
                    <Image
                      src={store.imageUrl}
                      alt={store.imageAltText || store.name}
                      width={32}
                      height={32}
                      className="rounded-md object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-md bg-muted" />
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">
                      {store.name}
                    </div>
                  </div>

                  {selected ? <Check className="h-4 w-4" /> : null}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
