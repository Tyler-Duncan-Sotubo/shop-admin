"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, AlertTriangle } from "lucide-react";
import { useAutosaveDraft } from "../context/autosave-context";

export function SaveStatus({ className }: { className?: string }) {
  const { isSaving, lastSavedAt, error } = useAutosaveDraft();
  const [showSaved, setShowSaved] = React.useState(false);

  React.useEffect(() => {
    if (!lastSavedAt) return;

    setShowSaved(true);
    const t = window.setTimeout(() => setShowSaved(false), 1200);
    return () => window.clearTimeout(t);
  }, [lastSavedAt]);

  // Error state takes priority if not actively saving
  if (error && !isSaving) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px]",
          "border-destructive/30 bg-destructive/10 text-destructive",
          className
        )}
      >
        <AlertTriangle className="size-3" />
        Couldn’t save
      </span>
    );
  }

  if (showSaved) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[9px]",
          "border-emerald-200 bg-emerald-50 text-emerald-700",
          className
        )}
      >
        <Check className="size-3" />
        Saved
      </span>
    );
  }

  return null;
}
