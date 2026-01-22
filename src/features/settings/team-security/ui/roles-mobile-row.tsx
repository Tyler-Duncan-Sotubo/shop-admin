// features/team-security/ui/roles-mobile-row.tsx
"use client";

import * as React from "react";
import type { DataTableMobileRowProps } from "@/shared/ui/data-table";
import type { RoleRow } from "../types/user.type";

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

function normalizeRoleKey(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, "_");
}

export function RolesMobileRow({ row }: DataTableMobileRowProps<RoleRow>) {
  const r = row.original;

  const normalized = normalizeRoleKey(r.name ?? "");
  const description =
    r.description ||
    ROLE_DESCRIPTIONS[normalized] ||
    "Custom role with configured permissions.";

  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-medium capitalize truncate">{r.name}</div>
          <div className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {description}
          </div>
        </div>
      </div>
    </div>
  );
}
