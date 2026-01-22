"use client";

import { ColumnDef } from "@tanstack/react-table";
import { SortableHeader } from "@/shared/ui/sortable-header";
import { RoleRow } from "../types/user.type";

/**
 * Known + future role descriptions (UI-only enhancement)
 * Key = normalized role name
 */
const ROLE_DESCRIPTIONS: Record<string, string> = {
  owner: "Full access to all settings, users, billing, and security.",
  admin: "Administrative access to manage users, roles, and system settings.",
  manager:
    "Manages day-to-day operations, users, and content with limited system access.",
  staff:
    "Handles operational tasks like orders, inventory, and customer support.",
  support: "Restricted access for customer assistance and troubleshooting.",
  accountant: "Access to billing, invoices, taxes, and financial reports.",
  marketing:
    "Manages promotions, discounts, storefront content, and campaigns.",
  warehouse:
    "Handles inventory, stock adjustments, and fulfillment operations.",
};

/**
 * Normalize role name → stable lookup key
 */
function normalizeRoleKey(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, "_");
}

export const rolesColumns: ColumnDef<RoleRow>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: ({ column }) => <SortableHeader column={column} title="Role" />,
    cell: ({ row }) => (
      <div className="font-medium capitalize">{row.original.name}</div>
    ),
  },
  {
    id: "description",
    accessorKey: "description",
    header: ({ column }) => (
      <SortableHeader column={column} title="Description" />
    ),
    cell: ({ row }) => {
      const roleName = row.original.name;
      const normalized = normalizeRoleKey(roleName);

      const description =
        row.original.description ||
        ROLE_DESCRIPTIONS[normalized] ||
        "Custom role with configured permissions.";

      return <div className="text-sm text-muted-foreground">{description}</div>;
    },
  },
];
