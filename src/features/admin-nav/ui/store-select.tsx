"use client";

import * as React from "react";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/shared/ui/select";
import { cn } from "@/lib/utils";

export type StoreSelectItem = {
  id: string;
  name: string;
  imageUrl?: string | null;
  imageAltText?: string | null;
};

type StoreSelectProps = {
  stores: StoreSelectItem[];
  value: string | null;
  onChange: (storeId: string | null) => void;
  placeholder?: string;
  className?: string;
};

function useMounted() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return mounted;
}

export function StoreSelect({
  stores,
  value,
  onChange,
  placeholder = "Select store",
  className,
}: StoreSelectProps) {
  const mounted = useMounted();

  // Ensure consistent controlled value: Select expects string | undefined
  const selectValue = value ?? undefined;

  const activeStore = React.useMemo(
    () => (value ? stores.find((s) => s.id === value) : undefined),
    [stores, value]
  );

  return (
    <Select value={selectValue} onValueChange={(v) => onChange(v ? v : null)}>
      <SelectTrigger className={cn("w-56", className)}>
        {/* Keep trigger markup stable; only enhance after mount */}
        {!mounted ? (
          <span className="text-muted-foreground">{placeholder}</span>
        ) : activeStore ? (
          <div className="flex items-center gap-2 truncate">
            {activeStore.imageUrl ? (
              <Image
                src={activeStore.imageUrl}
                alt={activeStore.imageAltText || activeStore.name}
                width={20}
                height={20}
                className="rounded object-cover"
                // helps avoid layout/paint differences
                priority={false}
              />
            ) : (
              <div className="h-5 w-5 rounded bg-muted" />
            )}
            <span className="truncate">{activeStore.name}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </SelectTrigger>

      {/* Radix SelectContent uses a portal; defer it until mounted */}
      {mounted && (
        <SelectContent>
          {stores.map((store) => (
            <SelectItem key={store.id} value={store.id}>
              <div className="flex items-center gap-2">
                {store.imageUrl ? (
                  <Image
                    src={store.imageUrl}
                    alt={store.imageAltText || store.name}
                    width={24}
                    height={24}
                    className="rounded object-cover"
                  />
                ) : (
                  <div className="h-6 w-6 rounded bg-muted" />
                )}
                <span>{store.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      )}
    </Select>
  );
}
