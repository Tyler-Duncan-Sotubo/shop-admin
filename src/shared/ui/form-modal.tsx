"use client";

import { ReactNode, FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";

type FormModalProps = {
  open: boolean;
  title: string;
  description?: string;
  mode?: "create" | "edit";
  onClose: () => void;

  // form handling
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;

  // buttons
  isSubmitting?: boolean;
  submitLabel?: string;
  cancelLabel?: string;

  /** Hide footer (useful for empty states / custom actions) */
  showFooter?: boolean;
  contentClassName?: string;

  children: ReactNode;
};

export function FormModal({
  open,
  title,
  description,
  mode,
  onClose,
  onSubmit,
  isSubmitting,
  submitLabel,
  cancelLabel = "Cancel",
  showFooter = true, // ✅ default
  children,
}: FormModalProps) {
  const finalSubmitLabel =
    submitLabel ??
    (mode === "create" ? "Create" : mode === "edit" ? "Save" : "Submit");

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent className={"bg-white max-w-lg"}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {children}

          {showFooter && (
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="clean"
                onClick={onClose}
                disabled={isSubmitting}
              >
                {cancelLabel}
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                {finalSubmitLabel}
              </Button>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
