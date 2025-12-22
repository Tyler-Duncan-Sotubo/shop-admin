"use client";

import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";

import { SortableHeader } from "@/shared/ui/sortable-header";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

import type { User } from "../types/user.type";
import { UserIcon } from "lucide-react";

type UsersColumnsOptions = {
  onEdit: (user: User) => void;
};

export const usersColumns = ({
  onEdit,
}: UsersColumnsOptions): ColumnDef<User>[] => [
  {
    id: "user",
    accessorFn: (row) => `${row.first_name} ${row.last_name}`.trim(),
    header: ({ column }) => <SortableHeader column={column} title="User" />,
    cell: ({ row }) => {
      const u = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            {u.avatar ? (
              <Image
                alt={`${u.first_name} ${u.last_name} avatar`}
                src={u.avatar}
                className="rounded-full object-cover"
                width={40}
                height={40}
              />
            ) : (
              <UserIcon className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0">
            <div className="font-medium truncate">
              {u.first_name} {u.last_name}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {u.email}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    id: "role",
    accessorKey: "role",
    header: ({ column }) => <SortableHeader column={column} title="Role" />,
    cell: ({ row }) => {
      const role = row.original.role;

      const label =
        role === "owner"
          ? "Owner"
          : role === "manager"
          ? "Manager"
          : role === "staff"
          ? "Staff"
          : role === "support"
          ? "Support"
          : "Unknown";

      return <Badge variant="outline">{label}</Badge>;
    },
  },
  {
    id: "status",
    accessorFn: (row) => row.status ?? "active",
    header: ({ column }) => <SortableHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.original.status ?? "active";

      const isActive = status === "active";
      const isInvited = status === "invited";

      return (
        <Badge
          variant={isActive ? "default" : isInvited ? "secondary" : "outline"}
        >
          {isActive ? "Active" : isInvited ? "Invited" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    id: "lastLogin",
    accessorFn: (row) => row.lastLogin ?? "",
    header: ({ column }) => (
      <SortableHeader column={column} title="Last Login" />
    ),
    cell: ({ row }) => {
      const lastLogin = row.original.lastLogin;
      return lastLogin ? (
        <span className="text-sm">
          {formatDistanceToNow(new Date(lastLogin), { addSuffix: true })}
        </span>
      ) : (
        <span className="text-sm text-muted-foreground">Never</span>
      );
    },
  },
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => {
      const u = row.original;
      return (
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(u)}
            disabled={u.role === "owner"}
          >
            Edit
          </Button>
        </div>
      );
    },
  },
];
