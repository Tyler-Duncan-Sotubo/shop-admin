"use client";

import { cn } from "@/lib/utils";
import { Card } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import type { InvoiceTemplate } from "../types/invoice-template.type";
import { Badge } from "@/shared/ui/badge";

export function TemplatePicker({
  templates,
  value,
  onChange,
  loading,
}: {
  templates: InvoiceTemplate[];
  value: string | null;
  onChange: (id: string) => void;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {templates.map((t) => {
        const active = value === t.id;
        return (
          <Card
            key={t.id}
            role="button"
            tabIndex={0}
            onClick={() => onChange(t.id)}
            onKeyDown={(e) => e.key === "Enter" && onChange(t.id)}
            className={cn(
              "cursor-pointer p-4 transition",
              active ? "border-primary" : "hover:border-muted-foreground/40"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">
                  {t.key} • {t.version}
                </p>
              </div>

              <div className="flex gap-2">
                {t.isDefault && <Badge>Default</Badge>}
                {t.isDeprecated && <Badge variant="secondary">Old</Badge>}
              </div>
            </div>

            <div className="mt-3 h-10 rounded-md bg-muted" />
            <p className="mt-2 text-xs text-muted-foreground">
              Server-rendered preview (matches PDF output).
            </p>
          </Card>
        );
      })}
    </div>
  );
}
