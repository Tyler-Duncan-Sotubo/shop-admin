// src/features/contact-emails/ui/contact-emails-mobile-row.tsx
"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import type { DataTableMobileRowProps } from "@/shared/ui/data-table";
import { Badge } from "@/shared/ui/badge";
import type { ContactEmailRow } from "../types/contact-email.type";
import {
  format,
  isSameDay,
  isThisYear,
  parseISO,
  isValid as isValidDate,
} from "date-fns";

function toDate(raw: any): Date | null {
  if (!raw) return null;
  if (raw instanceof Date) return isValidDate(raw) ? raw : null;
  if (typeof raw === "string") {
    const d = parseISO(raw);
    return isValidDate(d) ? d : null;
  }
  if (typeof raw === "number") {
    const d = new Date(raw);
    return isValidDate(d) ? d : null;
  }
  const d = new Date(raw);
  return isValidDate(d) ? d : null;
}

function fmtReceived(raw: any) {
  const d = toDate(raw);
  if (!d) return "—";
  const now = new Date();
  if (isSameDay(d, now)) return format(d, "p");
  return isThisYear(d) ? format(d, "MMM d") : format(d, "MMM d, yyyy");
}

function snippet(s?: string | null) {
  if (!s) return "—";
  const clean = s.replace(/\s+/g, " ").trim();
  return clean.length > 110 ? clean.slice(0, 110) + "…" : clean;
}

function StatusBadge({ status }: { status: string }) {
  return <Badge className="capitalize">{status}</Badge>;
}

export function ContactEmailsMobileRow({
  row,
  onRowClick,
}: DataTableMobileRowProps<ContactEmailRow>) {
  const m = row.original;

  return (
    <div
      className={[
        "px-4 py-4",
        onRowClick ? "cursor-pointer active:bg-muted/40" : "",
      ].join(" ")}
      onClick={() => onRowClick?.(m)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="text-sm font-semibold truncate">
              {m.name ?? "—"}
            </div>
            <span className="text-xs text-muted-foreground shrink-0">
              • {fmtReceived(m.createdAt)}
            </span>
          </div>

          <div className="mt-0.5 text-xs text-muted-foreground truncate">
            {m.email ?? "—"}
          </div>
        </div>

        <div className="shrink-0">
          <StatusBadge status={m.status} />
        </div>
      </div>

      <div className="mt-3 min-w-0">
        <div className="text-sm font-medium truncate">{m.subject ?? "—"}</div>
        <div className="mt-1 text-xs text-muted-foreground truncate">
          {snippet(m.message)}
        </div>
      </div>
    </div>
  );
}
