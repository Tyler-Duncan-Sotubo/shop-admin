"use client";

import { Button } from "@/shared/ui/button";
import { CompanyRole } from "../types/permissions.type";
import { formatRoleName } from "../utils/permissions.utils";
import { cn } from "@/lib/utils";
import { H4 } from "@/shared/ui/typography";

export function RolesList({
  roles,
  selectedRoleId,
  onSelect,
}: {
  roles: CompanyRole[];
  selectedRoleId: string | null;
  onSelect: (roleId: string) => void;
}) {
  return (
    <div className="w-1/4">
      <H4 className="font-semibold mb-2">Roles</H4>
      <ul className="space-y-2 mt-10">
        {roles.map((role) => (
          <li key={role.id}>
            <Button
              onClick={() => onSelect(role.id)}
              className={cn(
                "px-3 py-2 w-full text-left border",
                selectedRoleId === role.id
                  ? "text-white"
                  : "bg-white text-black"
              )}
            >
              {formatRoleName(role.name)}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
