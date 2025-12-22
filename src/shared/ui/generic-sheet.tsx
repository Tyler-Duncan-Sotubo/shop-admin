"use client";

import React, { ReactNode } from "react";
import {
  Sheet as ShadcnSheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "./sheet";

export interface GenericSheetProps {
  /** The button or element that opens the sheet */
  trigger: ReactNode;
  /** Title displayed in the sheet header */
  title: string | ReactNode;
  /** Optional description under the title */
  description?: string;
  /** Main content of the sheet (form, details, etc.) */
  children: ReactNode;
  /** Optional footer actions (buttons, etc.) */
  footer?: ReactNode;
  /** Sheet position (e.g. "right", "left", "top", "bottom") */
  position?: "top" | "right" | "bottom" | "left";
  /** Sheet size (per shadcn defaults: "xs", "sm", "md", "lg", "xl") */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  open?: boolean;
  /** Callback fired when sheet open state changes */
  onOpenChange?: (open: boolean) => void;
}

/**
 * A reusable sheet component wrapping shadcn/ui's Sheet primitives.
 */
export default function GenericSheet({
  trigger,
  title,
  description,
  children,
  footer,
  open,
  onOpenChange,
}: GenericSheetProps) {
  return (
    <ShadcnSheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>

      <SheetContent className="min-w-[550px] bg-white overflow-auto">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">{children}</div>

        {footer && <SheetFooter>{footer}</SheetFooter>}
      </SheetContent>
    </ShadcnSheet>
  );
}
