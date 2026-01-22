// features/api-keys/ui/api-keys-mobile-row.tsx
"use client";

import * as React from "react";
import type { DataTableMobileRowProps } from "@/shared/ui/data-table";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import type { ApiKeyRow } from "../types/api-keys.type";

export function ApiKeysMobileRow({
  row,
  table,
}: DataTableMobileRowProps<ApiKeyRow>) {
  const k = row.original;

  const meta = (table.options.meta ?? {}) as {
    onRevoke?: (id: string) => void;
    revokePending?: boolean;
  };

  const origins = k.allowedOrigins ?? [];

  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-medium truncate">{k.name}</div>

          <div className="mt-1 text-xs text-muted-foreground">
            Prefix:{" "}
            <span className="font-mono text-foreground">{k.prefix ?? "—"}</span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {k.isActive ? (
              <Badge variant="outline">Active</Badge>
            ) : (
              <Badge variant="secondary">Revoked</Badge>
            )}
          </div>

          <div className="mt-2 text-xs text-muted-foreground">
            Allowed origins:{" "}
            <span className="text-foreground">
              {origins.length ? origins.join(", ") : "Any"}
            </span>
          </div>
        </div>

        <div
          className="shrink-0"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <Button
            variant="outline"
            size="sm"
            disabled={!k.isActive || Boolean(meta.revokePending)}
            onClick={() => meta.onRevoke?.(k.id)}
          >
            Revoke
          </Button>
        </div>
      </div>
    </div>
  );
}
