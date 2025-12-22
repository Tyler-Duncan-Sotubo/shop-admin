"use client";

import { ColumnDef } from "@tanstack/react-table";
import { AuditLogDetailsSheet } from "./audit-details-sheet";
import { AuditLog } from "../types/audit.type";
import { ActionBadge } from "@/shared/ui/action-badge";
import { SortableHeader } from "@/shared/ui/sortable-header";

const RoleMap = {
  super_admin: "Super Admin",
  admin: "Admin",
};

export const auditColumns: ColumnDef<AuditLog>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <SortableHeader column={column} title="User" />,
    cell: ({ row }) => {
      const changedBy = row.getValue<string>("name");
      return (
        <div>
          <div className="capitalize">{changedBy ?? "Super Admin"}</div>
          <div className="text-xs text-textSecondary">
            {RoleMap[row.original.role as keyof typeof RoleMap]}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "timestamp",
    header: ({ column }) => (
      <SortableHeader column={column} title="Timestamp" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("timestamp"));
      return (
        <div>
          {new Intl.DateTimeFormat("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }).format(date)}
        </div>
      );
    },
  },
  {
    accessorKey: "action",
    header: ({ column }) => <SortableHeader column={column} title="Action" />,
    cell: ({ row }) => {
      const action = row.getValue<string>("action");
      return <ActionBadge action={action} />;
    },
  },
  {
    accessorKey: "entity",
    header: ({ column }) => <SortableHeader column={column} title="Entity" />,
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("entity")}</div>
    ),
  },
  {
    accessorKey: "details",
    header: () => <div>Details</div>,
    cell: ({ row }) => <AuditLogDetailsSheet initialData={row.original} />,
  },
];
