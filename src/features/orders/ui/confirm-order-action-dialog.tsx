// features/orders/components/confirm-order-action-dialog.tsx
"use client";

import { useMemo, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { Input } from "@/shared/ui/input";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  title: string;
  description: string;

  confirmLabel: string;
  confirmVariant?: "default" | "destructive";

  isLoading?: boolean;
  onConfirm: () => void;

  /** Optional extra safety: user must type this exact string */
  requireText?: string;
};

export function ConfirmOrderActionDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  confirmVariant = "default",
  isLoading,
  onConfirm,
  requireText,
}: Props) {
  const [typed, setTyped] = useState("");

  const needsText = Boolean(requireText?.trim().length);
  const canConfirm = useMemo(() => {
    if (isLoading) return false;
    if (!needsText) return true;
    return typed.trim() === requireText;
  }, [isLoading, needsText, typed, requireText]);

  return (
    <AlertDialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) setTyped("");
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <span className="block">{description}</span>

            {needsText && (
              <div className="space-y-2">
                <span className="text-sm">
                  Type <span className="font-mono">{requireText}</span> to
                  confirm.
                </span>
                <Input
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  placeholder={requireText}
                />
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>

          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              if (canConfirm) onConfirm();
            }}
            disabled={!canConfirm}
            className={
              confirmVariant === "destructive"
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : undefined
            }
          >
            {isLoading ? "Working..." : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
