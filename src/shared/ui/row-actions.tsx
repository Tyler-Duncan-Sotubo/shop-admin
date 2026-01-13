"use client";

import * as React from "react";
import Link from "next/link";
import { MoreVertical } from "lucide-react";

import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { DeleteIconDialog } from "@/shared/ui/delete-dialog-icon";

type RefetchKey =
  | string
  | string[]
  | Array<{
      key: string;
      params?: unknown;
    }>;

type RowActionsProps<T> = {
  editHref?: string;
  row: T;
  onEdit?: (row: T) => void;

  deleteEndpoint: string;
  refetchKey: RefetchKey;

  editLabel?: string;
  className?: string;
};

export function RowActions<T>({
  row,
  onEdit,
  deleteEndpoint,
  refetchKey,
  editLabel = "Edit",
  className,
  editHref,
}: RowActionsProps<T>) {
  return (
    <div className={`flex items-center justify-end pr-4 ${className ?? ""}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-40 bg-white">
          {/* Edit */}
          {editHref ? (
            <DropdownMenuItem>
              <Link
                className="text-xs text-primary hover:underline font-semibold"
                href={editHref}
              >
                {editLabel}
              </Link>
            </DropdownMenuItem>
          ) : onEdit ? (
            <DropdownMenuItem>
              <Button
                variant="link"
                className="h-auto p-0 text-xs"
                onClick={() => onEdit(row)}
              >
                {editLabel}
              </Button>
            </DropdownMenuItem>
          ) : null}

          {/* Delete (kept destructive & confirmed) */}
          <DropdownMenuItem
            onSelect={(e) => e.preventDefault()} // prevent menu close before dialog
            className="text-destructive focus:text-destructive px-4 hover:bg-none"
          >
            <DeleteIconDialog
              endpoint={deleteEndpoint}
              refetchKey={refetchKey}
            />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
