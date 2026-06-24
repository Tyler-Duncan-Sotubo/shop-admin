"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/shared/ui/sheet";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Button } from "@/shared/ui/button";
import { AlertTriangle } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
  error?: string | null;
  onConfirm: () => void;
};

export function ConfirmDispatchSheet({
  open,
  onOpenChange,
  isLoading,
  error,
  onConfirm,
}: Props) {
  const shortageLines = error?.includes(" | ")
    ? error.split(" | ")
    : error
      ? [error]
      : [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col h-full p-0 gap-0 w-full sm:max-w-[500px] bg-white">
        <SheetHeader className="px-4 pt-6 pb-4 border-b shrink-0">
          <SheetTitle>Confirm dispatch</SheetTitle>
          <SheetDescription>
            Confirm this order has been packed and is leaving the warehouse.
            Stock will be deducted from the origin location.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 min-h-0 px-4 py-4">
          {shortageLines.length > 0 && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 space-y-3">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <p className="text-sm font-semibold">Insufficient stock</p>
              </div>

              <p className="text-xs text-muted-foreground">
                The following items do not have enough stock at the origin
                location. Restock before confirming dispatch.
              </p>

              <ul className="space-y-2">
                {shortageLines.map((line, i) => {
                  const [item, detail] = line.split(": requested ");
                  return (
                    <li
                      key={i}
                      className="grid grid-cols-[1fr_auto] gap-2 rounded-md bg-white/60 px-3 py-2 text-xs border border-destructive/20"
                    >
                      <span className="font-medium text-foreground leading-snug">
                        {item}
                      </span>
                      {detail && (
                        <span className="text-destructive whitespace-nowrap font-mono">
                          {detail.replace("only ", "").replace(" available", " avail.")}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {!shortageLines.length && (
            <p className="text-sm text-muted-foreground">
              This action cannot be undone. Are you sure you want to confirm
              this dispatch?
            </p>
          )}
        </ScrollArea>

        <SheetFooter className="flex-row justify-end gap-2 px-4 py-4 border-t shrink-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading || shortageLines.length > 0}
            isLoading={isLoading}
          >
            Confirm dispatch
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
