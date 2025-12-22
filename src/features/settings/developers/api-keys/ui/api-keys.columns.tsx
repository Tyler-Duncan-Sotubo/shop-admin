"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/shared/ui/badge";
import type { ApiKeyRow } from "../types/api-keys.type";

export const apiKeysColumns = (): ColumnDef<ApiKeyRow>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
  },
  {
    accessorKey: "prefix",
    header: "Prefix",
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.prefix}</span>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) =>
      row.original.isActive ? (
        <Badge variant="outline">Active</Badge>
      ) : (
        <Badge variant="secondary">Revoked</Badge>
      ),
  },
  {
    accessorKey: "scopes",
    header: "Scopes",
    cell: ({ row }) => {
      const scopes = row.original.scopes ?? [];
      return scopes.length ? (
        <span className="text-xs">{scopes.join(", ")}</span>
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      );
    },
  },
  {
    accessorKey: "allowedOrigins",
    header: "Allowed origins",
    cell: ({ row }) => {
      const origins = row.original.allowedOrigins ?? [];
      return origins.length ? (
        <span className="text-xs">{origins.join(", ")}</span>
      ) : (
        <span className="text-xs text-muted-foreground">Any</span>
      );
    },
  },
];
