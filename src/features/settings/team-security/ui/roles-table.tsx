// features/team-security/ui/roles-table.tsx
"use client";

import { DataTable } from "@/shared/ui/data-table";
import { rolesColumns } from "./roles-columns";
import type { RoleRow } from "../types/user.type";
import { RolesMobileRow } from "./roles-mobile-row";

export function RolesTable({ data }: { data: RoleRow[] }) {
  return (
    <DataTable
      columns={rolesColumns}
      data={data}
      filterKey="name"
      filterPlaceholder="Search roles..."
      mobileRow={RolesMobileRow}
    />
  );
}
