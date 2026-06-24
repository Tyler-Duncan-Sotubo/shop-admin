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
  error?: string | null;
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
  error,
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
              <div>
                <span className="text-sm ">
                  Type <span className="font-mono">{requireText}</span> to
                  confirm.
                </span>
                <Input
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  placeholder={requireText}
                  className="mt-2"
                />
              </div>
            )}
            {error && (
              error.includes(" | ") ? (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 space-y-1.5">
                  <p className="text-xs font-semibold text-destructive">Insufficient stock:</p>
                  <ul className="space-y-1">
                    {error.split(" | ").map((line, i) => (
                      <li key={i} className="flex gap-2 text-xs text-destructive">
                        <span className="shrink-0 mt-0.5">•</span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-destructive">{error}</p>
              )
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
