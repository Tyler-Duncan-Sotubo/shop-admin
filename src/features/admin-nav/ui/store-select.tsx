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

  const isSingle = stores.length === 1;

  // Single store — just show the name, no dropdown
  if (isSingle) {
    return (
      <div className={cn("flex items-center gap-2 h-10 px-3", className)}>
        {active?.imageUrl ? (
          <Image
            src={active.imageUrl}
            alt={active.imageAltText || active.name}
            width={20}
            height={20}
            className="object-cover rounded-md"
          />
        ) : (
          <div className="rounded-md h-7 w-7 bg-muted" />
        )}
        <span className="text-xs font-extrabold truncate">
          {active?.name ?? placeholder}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            className="justify-between w-full h-10 px-3 text-black bg-primary/20 hover:bg-primary hover:text-white"
          >
            <div className="flex items-center min-w-0 gap-3">
              {active?.imageUrl ? (
                <Image
                  src={active.imageUrl}
                  alt={active.imageAltText || active.name}
                  width={20}
                  height={20}
                  className="object-cover rounded-md"
                />
              ) : (
                <div className="rounded-md h-7 w-7 bg-muted" />
              )}

              <div className="min-w-0 text-left">
                <div className="text-xs font-extrabold truncate">
                  {active?.name ?? placeholder}
                </div>
              </div>
            </div>

            <ChevronsUpDown className="w-4 h-4 text-muted-foreground" />
          </Button>
        </PopoverTrigger>

        <PopoverContent align="start" className="w-[220px] p-2">
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
            Select a store
          </div>

          <div className="overflow-auto max-h-60">
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
                      className="object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-md bg-muted" />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {store.name}
                    </div>
                  </div>

                  {selected ? <Check className="w-4 h-4" /> : null}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
