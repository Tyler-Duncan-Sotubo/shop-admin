"use client";

import { useState } from "react";
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
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useListBankAccounts,
  type BankAccount,
} from "@/features/settings/invoice-templates/hooks/use-bank-accounts";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
  onConfirm: (bankAccountId: string) => void;
};

export function IssueInvoiceSheet({ open, onOpenChange, isLoading, onConfirm }: Props) {
  const { data: accounts = [], isLoading: loadingAccounts } = useListBankAccounts();
  const [selected, setSelected] = useState<string | null>(null);

  const handleOpen = (v: boolean) => {
    onOpenChange(v);
    if (!v) setSelected(null);
  };

  const canConfirm = !!selected && !isLoading;

  return (
    <Sheet open={open} onOpenChange={handleOpen}>
      <SheetContent className="flex flex-col h-full p-0 gap-0 w-full sm:max-w-[420px] bg-white">
        <SheetHeader className="px-4 pt-6 pb-4 border-b shrink-0">
          <SheetTitle>Issue invoice</SheetTitle>
          <SheetDescription>
            Select the bank account to include on this invoice. This cannot be changed after issuing.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 min-h-0 px-4 py-4">
          {loadingAccounts && (
            <p className="text-sm text-muted-foreground">Loading accounts…</p>
          )}

          {!loadingAccounts && accounts.length === 0 && (
            <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
              No bank accounts configured. Add one under Invoice Settings before issuing.
            </div>
          )}

          <div className="space-y-2">
            {accounts.map((acc: BankAccount) => {
              const isSelected = selected === acc.id;
              return (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => setSelected(acc.id)}
                  className={cn(
                    "w-full text-left rounded-md border px-4 py-3 transition-colors",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-sm font-semibold">{acc.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {acc.bankName} · {acc.accountName}
                      </div>
                      <div className="text-xs font-mono text-muted-foreground">
                        {acc.accountNumber}
                        {acc.tin && ` · TIN: ${acc.tin}`}
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 text-primary shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>

        <SheetFooter className="flex-row justify-end gap-2 px-4 py-4 border-t shrink-0">
          <Button variant="outline" onClick={() => handleOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            disabled={!canConfirm}
            isLoading={isLoading}
            onClick={() => selected && onConfirm(selected)}
          >
            Issue invoice
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
