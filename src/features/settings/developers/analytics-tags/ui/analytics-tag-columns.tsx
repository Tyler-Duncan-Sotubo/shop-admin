"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { SortableHeader } from "@/shared/ui/sortable-header";
import { toast } from "sonner";
import type { AnalyticsTag } from "../types/analytics-tag.type";
import { format } from "date-fns";

export const analyticsTagColumns = (opts: {
  onCopySnippet: (tag: AnalyticsTag) => void;
  onRevoke: (tagId: string) => void;
  revokeLoadingId?: string | null;
}): ColumnDef<AnalyticsTag>[] => [
  {
    accessorKey: "createdAt",
    header: ({ column }) => <SortableHeader column={column} title="Created" />,
    cell: ({ row }) => {
      const v = row.original.createdAt;
      return v ? format(new Date(v), "dd MMM yyyy") : "—";
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => <SortableHeader column={column} title="Name" />,
    cell: ({ row }) => row.original.name ?? "—",
  },
  {
    accessorKey: "storeId",
    header: () => "Store",
    cell: ({ row }) => row.original.storeId ?? "Company default",
  },
  {
    accessorKey: "isActive",
    header: () => "Status",
    cell: ({ row }) =>
      row.original.isActive ? (
        <Badge>Active</Badge>
      ) : (
        <Badge variant="secondary">Revoked</Badge>
      ),
  },
  {
    accessorKey: "token",
    header: () => "Token",
    cell: ({ row }) => {
      const token = row.original.token;
      const short = token ? `${token.slice(0, 6)}…${token.slice(-6)}` : "—";
      return (
        <button
          className="text-primary underline"
          onClick={(e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(token);
            toast.success("Token copied");
          }}
        >
          {short}
        </button>
      );
    },
  },
  {
    id: "actions",
    header: () => "Actions",
    cell: ({ row }) => {
      const tag = row.original;
      const loading = opts.revokeLoadingId === tag.id;

      return (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              opts.onCopySnippet(tag);
            }}
          >
            Copy tag
          </Button>

          <Button
            size="sm"
            variant="destructive"
            disabled={!tag.isActive || loading}
            onClick={(e) => {
              e.stopPropagation();
              opts.onRevoke(tag.id);
            }}
          >
            {loading ? "Revoking..." : "Revoke"}
          </Button>
        </div>
      );
    },
  },
];
