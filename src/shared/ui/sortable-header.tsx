"use client";

import { Button } from "@/shared/ui/button";
import { ChevronUpDown } from "@/shared/ui/chevron-up-down";
import { Column } from "@tanstack/react-table";
import { cn } from "@/lib/utils";

interface SortableHeaderProps<TData> {
  column: Column<TData, unknown>;
  title: string;
  className?: string;
}

export function SortableHeader<TData>({
  column,
  title,
  className,
}: SortableHeaderProps<TData>) {
  return (
    <Button
      variant="ghost"
      className={cn(
        "px-0 hover:bg-transparent font-bold flex items-center gap-1",
        className
      )}
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {title}
      <ChevronUpDown direction={column.getIsSorted() as "asc" | "desc"} />
    </Button>
  );
}
