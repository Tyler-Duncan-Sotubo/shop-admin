"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from "next/image";
import type { DataTableMobileRowProps } from "@/shared/ui/data-table";
import type { MediaRow } from "../types/media.type";
import { Badge } from "@/shared/ui/badge";
import { RowActions } from "@/shared/ui/row-actions";
import { Button } from "@/shared/ui/button";
import { FiCopy, FiFileText, FiExternalLink } from "react-icons/fi";

function formatBytes(bytes?: number | null) {
  if (!bytes || bytes <= 0) return "—";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(k)),
    sizes.length - 1,
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

export function MediaMobileRow({ row }: DataTableMobileRowProps<MediaRow>) {
  const m = row.original;

  const isImage = (m.mimeType ?? "").startsWith("image/");
  const shortType = (m.mimeType ?? "—").split("/")[1] || (m.mimeType ?? "—");

  const handleCopy = async () => {
    if (!m.url) return;
    try {
      await navigator.clipboard.writeText(m.url);
    } catch {
      // optional toast
    }
  };

  const openUrl = () => {
    if (!m.url) return;
    window.open(m.url, "_blank", "noreferrer");
  };

  return (
    <div
      className={["px-4 py-4", "active:bg-muted/40", "select-none"].join(" ")}
    >
      <div className="flex items-start gap-4">
        {/* Thumb */}
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-muted flex items-center justify-center">
          {isImage && m.url ? (
            <Image
              src={m.url}
              alt={m.fileName ?? "Media"}
              fill
              className="object-cover"
            />
          ) : (
            <FiFileText className="text-muted-foreground" size={18} />
          )}
        </div>

        {/* Main */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">
                {m.fileName ?? "—"}
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge className="capitalize h-5 px-2 text-[10px]">
                  {shortType}
                </Badge>
                <span>{formatBytes(m.size)}</span>
                <span className="text-muted-foreground/60">•</span>
                <span>{fmtDate(m.createdAt)}</span>
              </div>
            </div>

            {/* Right actions */}
            <div
              className="shrink-0 flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {m.url ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={openUrl}
                  title="Open"
                  className="h-9 w-9 text-muted-foreground hover:text-foreground"
                >
                  <FiExternalLink size={14} />
                </Button>
              ) : null}

              {m.url ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopy}
                  title="Copy URL"
                  className="h-9 w-9 text-muted-foreground hover:text-foreground"
                >
                  <FiCopy size={14} />
                </Button>
              ) : null}

              <RowActions
                row={m as any}
                editHref={undefined}
                deleteEndpoint={`/api/media/${m.id}`}
                refetchKey="media-files"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
