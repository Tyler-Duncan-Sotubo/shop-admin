"use client";

import { Badge } from "@/shared/ui/badge";
import { cn } from "@/lib/utils";

export type FilterChip<T extends string> = {
  value: T;
  label: string;
  count?: number;
  showZero?: boolean;
  disabled?: boolean;
};

interface FilterChipsProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  chips: FilterChip<T>[];

  /** layout */
  wrap?: boolean; // default true
  scrollable?: boolean; // horizontal scroll instead of wrap

  className?: string;
}

export function FilterChips<T extends string>({
  value,
  onChange,
  chips,
  wrap = true,
  scrollable = false,
  className,
}: FilterChipsProps<T>) {
  return (
    <div className={cn("sm:hidden", scrollable ? "-mx-3 px-4" : "", className)}>
      <div
        className={cn(
          "flex gap-1",
          wrap && !scrollable && "flex-wrap",
          scrollable && "overflow-x-auto whitespace-nowrap",
        )}
      >
        {chips
          .filter(
            (c) =>
              c.showZero !== false || (c.count ?? 0) > 0 || c.value === value,
          )
          .map((c) => {
            const active = value === c.value;
            const disabled =
              c.disabled ?? (c.showZero === false && (c.count ?? 0) === 0);

            return (
              <button
                key={c.value}
                type="button"
                disabled={disabled}
                onClick={() => !disabled && onChange(c.value)}
                className={cn(
                  "active:scale-[0.98]",
                  disabled && "opacity-50 cursor-not-allowed",
                )}
              >
                <Badge
                  variant="secondary"
                  className={cn(
                    "rounded-full px-3 py-1 text-xs cursor-pointer select-none",
                    "bg-transparent border",
                    active
                      ? "font-bold text-primary border-primary/40"
                      : "text-muted-foreground",
                  )}
                >
                  {c.label}

                  {typeof c.count === "number" && (
                    <span
                      className={cn(
                        "ml-1 rounded-full px-1.5 py-0.5 text-[10px]",
                        active ? "bg-background/20" : "bg-background/40",
                      )}
                    >
                      {c.count}
                    </span>
                  )}
                </Badge>
              </button>
            );
          })}
      </div>
    </div>
  );
}
