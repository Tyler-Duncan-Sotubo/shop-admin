// src/shared/ui/date-range-picker.tsx
"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Calendar } from "@/shared/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

export type { DateRange };

export function DateRangePicker({
  value,
  onChange,
  className,
  align = "end",
  placeholder = "Pick a date range",
}: {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  className?: string;
  align?: "start" | "center" | "end";
  placeholder?: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            // match SelectTrigger exactly
            "bg-white dark:bg-white text-foreground",
            "border border-input rounded-md shadow-xs",
            "flex items-center gap-2 px-4 py-4.5 text-sm whitespace-nowrap",
            "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-[color,box-shadow]",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="h-4 w-4 shrink-0 opacity-50" />
          {value?.from ? (
            value.to ? (
              <span>
                {format(value.from, "MMM d, yyyy")} –{" "}
                {format(value.to, "MMM d, yyyy")}
              </span>
            ) : (
              <span>{format(value.from, "MMM d, yyyy")}</span>
            )
          ) : (
            <span>{placeholder}</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align}>
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={value?.from}
          selected={value}
          onSelect={(range) => {
            onChange?.(range);
            if (range?.from && range?.to) setOpen(false);
          }}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}
