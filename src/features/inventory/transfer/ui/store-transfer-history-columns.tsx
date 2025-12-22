/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { StoreTransferHistoryRow } from "../types/transfer-history.type";

function humanStatus(status?: string | null) {
  switch (status) {
    case "pending":
      return "Pending";
    case "in_transit":
      return "In transit";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    default:
      return "—";
  }
}

function getStatusChange(changes: any) {
  const before = changes?.beforeStatus;
  const after = changes?.afterStatus;

  if (before || after) {
    return `${humanStatus(before)} → ${humanStatus(after)}`;
  }

  // Creation event
  return "→ Pending";
}

function who(by: StoreTransferHistoryRow["by"]) {
  const name = [by?.firstName, by?.lastName].filter(Boolean).join(" ");
  return name || "—";
}

export const storeTransferHistoryColumns: ColumnDef<StoreTransferHistoryRow>[] =
  [
    {
      accessorKey: "timestamp",
      header: "Time",
      cell: ({ row }) => {
        const d = new Date(row.original.timestamp);
        return (
          <span className="text-sm">
            {Number.isNaN(d.getTime())
              ? row.original.timestamp
              : d.toLocaleString()}
          </span>
        );
      },
    },
    {
      id: "actor",
      header: "By",
      cell: ({ row }) => (
        <span className="font-medium">{who(row.original.by)}</span>
      ),
    },
    {
      id: "route",
      header: "Route",
      cell: ({ row }) => {
        const r = row.original;
        return (
          <div className="space-y-0.5">
            <div className="font-medium">
              {r.fromLocationName ?? "Unknown"}{" "}
              <span className="text-muted-foreground">→</span>{" "}
              {r.toLocationName ?? "Unknown"}
            </div>
          </div>
        );
      },
    },
    {
      id: "statusChange",
      header: "Status",
      cell: ({ row }) => (
        <span className="text-sm">{getStatusChange(row.original.changes)}</span>
      ),
    },
    {
      id: "routeSearch",
      accessorFn: (r) =>
        [
          r.transferId,
          r.fromLocationName ?? "",
          r.toLocationName ?? "",
          r.by?.firstName ?? "",
          r.by?.lastName ?? "",
          r.changes?.beforeStatus ?? "",
          r.changes?.afterStatus ?? "",
        ]
          .join(" ")
          .toLowerCase(),
      header: () => null,
      cell: () => null,
      enableSorting: false,
    },
  ];
