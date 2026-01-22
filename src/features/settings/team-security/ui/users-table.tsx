// features/team-security/ui/users-table.tsx
"use client";

import { DataTable } from "@/shared/ui/data-table";
import type { User } from "../types/user.type";
import { usersColumns } from "./users-columns";
import { UsersMobileRow } from "./users-mobile-row";

export function UsersTable({
  data,
  onEdit,
}: {
  data: User[];
  onEdit: (user: User) => void;
}) {
  return (
    <DataTable
      columns={usersColumns({ onEdit })}
      data={data}
      filterKey="user"
      filterPlaceholder="Search users..."
      mobileRow={UsersMobileRow}
      // ✅ so the mobile row can call onEdit without coupling to column defs
      tableMeta={{ onEdit }}
    />
  );
}
