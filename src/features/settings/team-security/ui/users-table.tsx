"use client";

import { DataTable } from "@/shared/ui/data-table";
import type { User } from "../types/user.type";
import { usersColumns } from "./users-columns";

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
    />
  );
}
