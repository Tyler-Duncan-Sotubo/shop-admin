// features/blog/components/blog-posts-mobile-row.tsx
"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import type { DataTableMobileRowProps } from "@/shared/ui/data-table";
import { Badge } from "@/shared/ui/badge";
import { RowActions } from "@/shared/ui/row-actions";
import { MdArticle } from "react-icons/md";

import type { BlogPostListRow, BlogPostStatus } from "../types/blog-post.type";

const BLOG_STATUS_LABEL: Record<BlogPostStatus, string> = {
  draft: "Draft",
  published: "Published",
};

const BLOG_STATUS_STYLES: Record<BlogPostStatus, string> = {
  draft: "bg-yellow-100 text-yellow-700",
  published: "bg-green-100 text-green-700",
};

function fmtDate(raw: any) {
  const d = raw ? new Date(raw) : null;
  if (!d) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export function BlogPostsMobileRow({
  row,
  onRowClick,
}: DataTableMobileRowProps<BlogPostListRow>) {
  const p = row.original;

  const status = (p.status ?? "draft") as BlogPostStatus;
  const editHref = `/content/blog/edit/${p.id}`;

  return (
    <div
      className={[
        "p-4",
        onRowClick ? "cursor-pointer active:bg-muted/40" : "",
      ].join(" ")}
      onClick={() => onRowClick?.(p)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {/* Thumb */}
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border bg-muted flex items-center justify-center">
            {p.coverImageUrl ? (
              <Image
                src={p.coverImageUrl}
                alt={p.title ?? "Post"}
                fill
                className="object-cover"
              />
            ) : (
              <MdArticle className="text-muted-foreground" size={18} />
            )}
          </div>

          {/* Main */}
          <div className="min-w-0">
            <Link
              href={editHref}
              className="block font-semibold text-primary hover:underline truncate max-w-[70vw]"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {p.title ?? "—"}
            </Link>

            <div className="mt-1 text-xs text-muted-foreground truncate max-w-[70vw]">
              /{p.slug ?? "—"}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge className={`capitalize ${BLOG_STATUS_STYLES[status]}`}>
                {BLOG_STATUS_LABEL[status]}
              </Badge>

              <span className="text-xs text-muted-foreground">
                Created:{" "}
                <span className="tabular-nums">{fmtDate(p.createdAt)}</span>
              </span>

              <span className="text-xs text-muted-foreground">
                Published:{" "}
                <span className="tabular-nums">
                  {p.publishedAt ? fmtDate(p.publishedAt) : "—"}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Actions (right) */}
        <div
          className="shrink-0"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <RowActions
            row={p as any}
            editHref={editHref}
            deleteEndpoint={`/api/blog-posts/${p.id}`}
            refetchKey="blog-posts"
          />
        </div>
      </div>
    </div>
  );
}
