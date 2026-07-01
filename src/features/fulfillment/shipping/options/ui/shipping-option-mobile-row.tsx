"use client";

import type { DataTableMobileRowProps } from "@/shared/ui/data-table";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { FaPen, FaTrash } from "react-icons/fa6";
import { cn } from "@/lib/utils";
import type { ShippingOption } from "../hooks/use-shipping-options";

export function ShippingOptionMobileRow({
  row,
  table,
}: DataTableMobileRowProps<ShippingOption>) {
  const opt = row.original;
  const meta = (table.options.meta ?? {}) as {
    onEdit?: (row: ShippingOption) => void;
    onDelete?: (row: ShippingOption) => void;
    onToggle?: (row: ShippingOption) => void;
  };

  const coverageLabel = () => {
    if (opt.states.length === 0) return "All states";
    if (opt.area) return `${opt.states[0]} · ${opt.area}`;
    if (opt.states.length <= 3) return opt.states.join(", ");
    return `${opt.states.slice(0, 3).join(", ")} +${opt.states.length - 3} more`;
  };

  return (
    <div className="px-4 py-4">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">{opt.name}</div>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <button
                  type="button"
                  onClick={() => meta.onToggle?.(opt)}
                  className="focus:outline-none"
                >
                  <Badge
                    variant={opt.isActive ? "default" : "secondary"}
                    className={cn(
                      "h-5 px-2 text-[10px] cursor-pointer",
                      opt.isActive && "bg-green-100 text-green-800 hover:bg-green-200",
                    )}
                  >
                    {opt.isActive ? "Active" : "Inactive"}
                  </Badge>
                </button>
                <span className="text-muted-foreground/60">•</span>
                <span className="truncate">{coverageLabel()}</span>
              </div>
            </div>

            <div
              className="shrink-0 flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => meta.onEdit?.(opt)}
              >
                <FaPen className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => meta.onDelete?.(opt)}
              >
                <FaTrash className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 text-xs">
            <span className="text-muted-foreground">Fee</span>
            <span className="font-medium text-foreground">
              ₦{opt.price.toLocaleString("en-NG", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
