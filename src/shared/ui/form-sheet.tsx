"use client";

import { ReactNode, FormEvent } from "react";
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
import { cn } from "@/lib/utils";

type FormSheetProps = {
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
  className?: string;
  children: ReactNode;
};

export function FormSheet({
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
  className,
  children,
}: FormSheetProps) {
  const finalSubmitLabel =
    submitLabel ??
    (mode === "create" ? "Create" : mode === "edit" ? "Save" : "Submit");

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <SheetContent
        className={cn(
          "flex flex-col h-full p-0 gap-0 w-full sm:max-w-[550px] bg-white",
          className,
        )}
      >
        <SheetHeader className="px-4 pt-6 pb-4 border-b shrink-0">
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>

        <form
          onSubmit={onSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <ScrollArea className="flex-1 min-h-0 px-4 py-4">
            {children}
          </ScrollArea>

          {showFooter && (
            <SheetFooter className="flex-row justify-end gap-2 px-4 py-4 border-t shrink-0">
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
            </SheetFooter>
          )}
        </form>
      </SheetContent>
    </Sheet>
  );
}
