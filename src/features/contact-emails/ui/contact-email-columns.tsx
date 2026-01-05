/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/shared/ui/badge";
import { SortableHeader } from "@/shared/ui/sortable-header";
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

/**
 * Display rule:
 * - Same day → time
 * - Otherwise → Jan 6 / Jan 6, 2025
 */
function fmtReceived(raw: any) {
  const d = toDate(raw);
  if (!d) return "—";

  const now = new Date();

  if (isSameDay(d, now)) {
    return format(d, "p");
  }

  return isThisYear(d) ? format(d, "MMM d") : format(d, "MMM d, yyyy");
}

function snippet(s?: string | null) {
  if (!s) return "—";
  const clean = s.replace(/\s+/g, " ").trim();
  return clean.length > 90 ? clean.slice(0, 90) + "…" : clean;
}

function statusBadge(status: string) {
  return <Badge className="capitalize">{status}</Badge>;
}

export const contactEmailColumns: ColumnDef<ContactEmailRow>[] = [
  {
    accessorKey: "status",
    header: ({ column }) => <SortableHeader column={column} title="Status" />,
    cell: ({ row }) => statusBadge(row.original.status),
  },

  {
    accessorKey: "name",
    header: ({ column }) => <SortableHeader column={column} title="From" />,
    cell: ({ row }) => {
      const name = row.original.name ?? "—";
      const email = row.original.email ?? "—";
      return (
        <div className="min-w-0">
          <div className="font-medium truncate max-w-[220px]">{name}</div>
          <div className="text-xs text-muted-foreground truncate max-w-[220px]">
            {email}
          </div>
        </div>
      );
    },
  },

  {
    accessorKey: "subject",
    header: () => <div>Message</div>,
    cell: ({ row }) => {
      const subject = row.original.subject ?? "—";
      const message = row.original.message;

      return (
        <div className="min-w-0 max-w-[520px]">
          <div className="font-medium truncate">{subject}</div>
          <div className="text-xs text-muted-foreground truncate">
            {snippet(message)}
          </div>
        </div>
      );
    },
    enableSorting: false,
  },

  {
    accessorKey: "createdAt",
    header: ({ column }) => <SortableHeader column={column} title="Received" />,
    cell: ({ row }) => (
      <div className="tabular-nums">{fmtReceived(row.original.createdAt)}</div>
    ),
  },
];
