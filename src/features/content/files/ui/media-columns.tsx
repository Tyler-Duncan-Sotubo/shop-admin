/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import { ColumnDef } from "@tanstack/react-table";
import { SortableHeader } from "@/shared/ui/sortable-header";
import { Badge } from "@/shared/ui/badge";
import { RowActions } from "@/shared/ui/row-actions";
import type { MediaRow } from "../types/media.type";
import { FiFileText, FiCopy } from "react-icons/fi";
import { Button } from "@/shared/ui/button";

function formatBytes(bytes?: number | null) {
  if (!bytes || bytes <= 0) return "—";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(k)),
    sizes.length - 1
  );
  const value = bytes / Math.pow(k, i);
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${sizes[i]}`;
}

function fmtDate(raw: any) {
  const d = raw ? new Date(raw) : null;
  if (!d) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export const mediaColumns: ColumnDef<MediaRow>[] = [
  {
    accessorKey: "url",
    header: () => <div className="w-12" />,
    cell: ({ row }) => {
      const url = row.original.url;
      const isImage = (row.original.mimeType ?? "").startsWith("image/");

      return (
        <div className="relative h-10 w-10 overflow-hidden rounded-md border bg-muted flex items-center justify-center">
          {isImage && url ? (
            <Image
              src={url}
              alt={row.original.fileName ?? "Media Thumbnail"}
              fill
              className="object-cover"
            />
          ) : (
            <FiFileText className="text-muted-foreground" size={18} />
          )}
        </div>
      );
    },
    enableSorting: false,
  },

  {
    accessorKey: "fileName",
    header: ({ column }) => <SortableHeader column={column} title="File" />,
    cell: ({ row }) => {
      const { fileName, url } = row.original;

      return (
        <div className="min-w-0 flex items-center gap-2">
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-primary hover:underline truncate block max-w-[220px]"
          >
            {fileName ?? "—"}
          </a>
        </div>
      );
    },
  },

  {
    accessorKey: "mimeType",
    header: ({ column }) => <SortableHeader column={column} title="Type" />,
    cell: ({ row }) => {
      const type = row.original.mimeType ?? "—";
      const short = type.split("/")[1] ? type.split("/")[1] : type;
      return <Badge className="capitalize">{short}</Badge>;
    },
  },

  {
    accessorKey: "size",
    header: ({ column }) => <SortableHeader column={column} title="Size" />,
    cell: ({ row }) => (
      <div className="tabular-nums">{formatBytes(row.original.size)}</div>
    ),
  },

  {
    accessorKey: "createdAt",
    header: ({ column }) => <SortableHeader column={column} title="Uploaded" />,
    cell: ({ row }) => (
      <div className="tabular-nums">{fmtDate(row.original.createdAt)}</div>
    ),
  },

  {
    id: "actions",
    header: () => <div className="text-center">Action</div>,
    cell: ({ row }) => {
      const id = row.original.id;

      const { url, mimeType } = row.original;
      const isImage = (mimeType ?? "").startsWith("image/");

      const handleCopy = async () => {
        if (!url) return;
        try {
          await navigator.clipboard.writeText(url);
        } catch {
          // optional: toast error
        }
      };

      return (
        <div className="flex items-center justify-end gap-2">
          <RowActions
            row={row.original as any}
            editHref={undefined}
            deleteEndpoint={`/api/media/${id}`}
            refetchKey="media-files"
          />
          {isImage && url ? (
            <Button
              variant="ghost"
              onClick={handleCopy}
              title="Copy image URL"
              className="text-muted-foreground hover:text-foreground"
            >
              <FiCopy size={14} />
            </Button>
          ) : null}
        </div>
      );
    },
    enableSorting: false,
  },
];
