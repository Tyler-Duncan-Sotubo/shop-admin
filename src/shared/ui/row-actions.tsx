"use client";

import * as React from "react";
import { Button } from "@/shared/ui/button";
import { DeleteIconDialog } from "@/shared/ui/delete-dialog-icon";
import Link from "next/link";

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
    <div
      className={`flex gap-3 px-2 items-center justify-end pr-4 ${
        className ?? ""
      }`}
    >
      {editHref ? (
        <Link href={editHref} className="text-primary hover:underline text-xs">
          Edit
        </Link>
      ) : null}

      {!editHref && onEdit ? (
        <Button variant="link" size="sm" onClick={() => onEdit(row)}>
          {editLabel}
        </Button>
      ) : null}

      <DeleteIconDialog endpoint={deleteEndpoint} refetchKey={refetchKey} />
    </div>
  );
}
