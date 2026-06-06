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
import { cn } from "@/lib/utils";

type FormModalProps = {
  open: boolean;
  title: string;
  description?: string;
  mode?: "create" | "edit";
  onClose: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
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
  showFooter = true,
  contentClassName,
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
      <DialogContent
        className={cn(
          "bg-white max-w-2xl w-[90vw] flex flex-col max-h-[80vh]",
          contentClassName,
        )}
      >
        <DialogHeader className="shrink-0">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <form
          onSubmit={onSubmit}
          className="flex flex-col flex-1 min-h-0 space-y-4"
        >
          <div className="flex-1 overflow-y-auto pr-1">{children}</div>

          {showFooter && (
            <DialogFooter className="shrink-0 mt-4">
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
