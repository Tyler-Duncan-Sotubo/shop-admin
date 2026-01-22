/* eslint-disable @typescript-eslint/no-explicit-any */
// features/team-security/ui/users-mobile-row.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import type { DataTableMobileRowProps } from "@/shared/ui/data-table";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { UserIcon } from "lucide-react";
import type { User } from "../types/user.type";

function RoleBadge({ role }: { role?: string | null }) {
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
}

function StatusBadge({ status }: { status?: string | null }) {
  const s = status ?? "active";
  const isActive = s === "active";
  const isInvited = s === "invited";

  return (
    <Badge variant={isActive ? "default" : isInvited ? "secondary" : "outline"}>
      {isActive ? "Active" : isInvited ? "Invited" : "Inactive"}
    </Badge>
  );
}

export function UsersMobileRow({
  row,
  table,
  onRowClick,
}: DataTableMobileRowProps<User>) {
  const u = row.original;

  // pull onEdit from table meta (no need to change your columns)
  const meta = (table.options.meta ?? {}) as {
    onEdit?: (user: User) => void;
  };

  const lastLogin = u.lastLogin
    ? formatDistanceToNow(new Date(u.lastLogin), { addSuffix: true })
    : null;

  return (
    <div
      className={[
        "p-4",
        onRowClick ? "cursor-pointer active:bg-muted/40" : "",
      ].join(" ")}
      onClick={() => onRowClick?.(u)}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: avatar + name/email */}
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
            {u.avatar ? (
              <Image
                alt={`${u.first_name} ${u.last_name} avatar`}
                src={u.avatar}
                className="h-10 w-10 object-cover"
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

            {/* chips */}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <RoleBadge role={u.role as any} />
              <StatusBadge status={u.status as any} />
            </div>

            <div className="mt-2 text-xs text-muted-foreground">
              Last login:{" "}
              <span className="text-foreground">{lastLogin ?? "Never"}</span>
            </div>
          </div>
        </div>

        {/* Right: action */}
        <div
          className="shrink-0"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <Button
            size="sm"
            variant="outline"
            onClick={() => meta.onEdit?.(u)}
            disabled={u.role === "owner"}
          >
            Edit
          </Button>
        </div>
      </div>
    </div>
  );
}
