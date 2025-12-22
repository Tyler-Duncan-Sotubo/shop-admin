"use client";

import { DataTable } from "@/shared/ui/data-table";
import { rolesColumns } from "./roles-columns";
import { RoleRow } from "../types/user.type";

export function RolesTable({ data }: { data: RoleRow[] }) {
  return (
    <DataTable
      columns={rolesColumns}
      data={data}
      filterKey="name"
      filterPlaceholder="Search roles..."
    />
  );
}
