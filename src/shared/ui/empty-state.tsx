"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./button";
import { cn } from "@/lib/utils";

type Action =
  | { label: string; href: string; onClick?: never }
  | { label: string; onClick: () => void; href?: never };

type EmptyStateProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  primaryAction?: Action;
  secondaryAction?: Action;
  className?: string;
  centered?: boolean;
};

function normalizePath(p: string) {
  const clean = p.split("?")[0].split("#")[0];
  return clean !== "/" ? clean.replace(/\/$/, "") : clean;
}

export function EmptyState({
  title,
  description,
  icon,
  primaryAction,
  secondaryAction,
  className,
  centered = true,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "w-full",
        centered
          ? "flex min-h-[60vh] flex-col items-center justify-center p-8 text-center"
          : "p-8",
        className
      )}
    >
      {icon && (
        <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full border bg-muted/40">
          <span className="[&_svg]:h-12 [&_svg]:w-12">{icon}</span>
        </div>
      )}

      <h3 className="text-base font-semibold">{title}</h3>

      {description && (
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {description}
        </p>
      )}

      {(primaryAction || secondaryAction) && (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {primaryAction && <ActionButton action={primaryAction} />}
          {secondaryAction && <ActionButton action={secondaryAction} />}
        </div>
      )}
    </div>
  );
}

function ActionButton({ action }: { action: Action }) {
  const pathname = usePathname();

  if ("href" in action) {
    const target = normalizePath(action.href || "");
    const current = normalizePath(pathname || "");

    if (target === current) {
      return (
        <Button
          variant="default"
          onClick={() => {
            // ✅ hard reload when linking to same page
            if (action.href) {
              window.location.href = action.href;
            }
          }}
        >
          {action.label}
        </Button>
      );
    }

    return (
      <Link href={action.href || "#"}>
        <Button variant="default">{action.label}</Button>
      </Link>
    );
  }

  return (
    <Button variant="default" onClick={action.onClick}>
      {action.label}
    </Button>
  );
}
