/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import type { DataTableMobileRowProps } from "@/shared/ui/data-table";
import type { Category } from "../types/category.type";
import { Badge } from "@/shared/ui/badge";
import { RowActions } from "@/shared/ui/row-actions";

export function CategoriesMobileRow({
  row,
  onRowClick,
}: DataTableMobileRowProps<Category>) {
  const c = row.original;
  const parentLabel = (c as any).parentName ?? (c.parentId ? "—" : "No parent");

  return (
    <div
      className={[
        "px-4 py-4",
        onRowClick ? "cursor-pointer active:bg-muted/40" : "",
      ].join(" ")}
      onClick={() => onRowClick?.(c)}
    >
      <div className="flex items-start gap-4">
        {/* Bigger image */}
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-muted">
          {c.imageUrl ? (
            <Image
              src={c.imageUrl}
              alt={c.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full" />
          )}
        </div>

        {/* Main content */}
        <div className="min-w-0 flex-1">
          {/* Title + status + actions */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold truncate">{c.name}</div>
                {c.isActive ? (
                  <Badge className="h-5 px-2 text-[10px]">Active</Badge>
                ) : (
                  <Badge variant="outline" className="h-5 px-2 text-[10px]">
                    Inactive
                  </Badge>
                )}
              </div>
            </div>

            <div
              className="shrink-0"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <RowActions
                row={c}
                deleteEndpoint={`/api/catalog/categories/${c.id}`}
                refetchKey="categories"
              />
            </div>
          </div>

          {/* Parent + product count side by side */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {c.parentId ? (
              <span className="truncate">
                Parent:{" "}
                <span className="font-medium text-foreground">
                  {parentLabel}
                </span>
              </span>
            ) : null}

            <span className="flex items-center gap-1">
              <span>Products:</span>
              <span className="font-medium text-foreground tabular-nums">
                {c.productCount ?? 0}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
