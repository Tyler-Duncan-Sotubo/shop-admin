/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { SortableHeader } from "@/shared/ui/sortable-header";
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

export const blogPostColumns: ColumnDef<BlogPostListRow>[] = [
  {
    accessorKey: "coverImageUrl",
    header: () => <div className="w-10" />,
    cell: ({ row }) => {
      const url = row.original.coverImageUrl;

      return (
        <div className="relative h-10 w-10 overflow-hidden rounded-md border bg-muted flex items-center justify-center">
          {url ? (
            <Image
              src={url}
              alt={row.original.title}
              fill
              className="object-cover"
            />
          ) : (
            <MdArticle className="text-muted-foreground" size={18} />
          )}
        </div>
      );
    },
    enableSorting: false,
  },

  {
    accessorKey: "title",
    header: ({ column }) => <SortableHeader column={column} title="Post" />,
    cell: ({ row }) => (
      <div className="font-medium">
        <Link
          href={`/content/blog/edit/${row.original.id}`}
          className="text-primary font-bold"
        >
          {row.original.title}
        </Link>

        <div className="text-xs text-muted-foreground mt-1">
          /{row.original.slug}
        </div>
      </div>
    ),
  },

  {
    accessorKey: "status",
    header: ({ column }) => <SortableHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = (row.original.status ?? "draft") as BlogPostStatus;

      return (
        <Badge className={`capitalize ${BLOG_STATUS_STYLES[status]}`}>
          {BLOG_STATUS_LABEL[status]}
        </Badge>
      );
    },
  },

  {
    accessorKey: "publishedAt",
    header: ({ column }) => (
      <SortableHeader column={column} title="Published" />
    ),
    cell: ({ row }) => {
      const raw = row.original.publishedAt;
      if (!raw) return <div className="text-muted-foreground">—</div>;

      const date = new Date(raw);
      return (
        <div className="tabular-nums">
          {new Intl.DateTimeFormat("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }).format(date)}
        </div>
      );
    },
  },

  {
    accessorKey: "createdAt",
    header: ({ column }) => <SortableHeader column={column} title="Created" />,
    cell: ({ row }) => {
      const raw = row.original.createdAt as any;
      const date = raw ? new Date(raw) : null;
      if (!date) return <div className="text-muted-foreground">—</div>;

      return (
        <div className="tabular-nums">
          {new Intl.DateTimeFormat("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }).format(date)}
        </div>
      );
    },
  },

  {
    accessorKey: "actions",
    header: () => <div className="text-center">Action</div>,
    cell: ({ row }) => {
      const id = row.original.id;

      return (
        <RowActions
          row={row.original as any}
          editHref={`/content/blog/posts/${id}`}
          deleteEndpoint={`/api/blog-posts/${id}`}
          refetchKey="blog-posts"
        />
      );
    },
    enableSorting: false,
  },
];
