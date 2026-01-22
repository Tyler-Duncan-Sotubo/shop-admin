"use client";

import { useMemo, useState } from "react";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";

import { Permission } from "../types/permissions.type";
import {
  PERMISSION_CATALOG,
  PermissionLevel,
} from "../config/permission-catalog";
import {
  buildKeyToIdMap,
  computeModuleLevel,
  setModuleLevel,
} from "../utils/permission-mapping.utils";

type Props = {
  permissions: Permission[];
  enabledIds: Set<string>;
  onToggle: (permId: string, checked: boolean) => void;
};

const LEVELS: { value: PermissionLevel; label: string }[] = [
  { value: "none", label: "None" },
  { value: "view", label: "View" },
  { value: "manage", label: "Manage" },
  { value: "admin", label: "Admin" },
];

export function PermissionsSimple({
  permissions,
  enabledIds,
  onToggle,
}: Props) {
  const [search, setSearch] = useState("");

  const keyToId = useMemo(() => buildKeyToIdMap(permissions), [permissions]);

  const modules = useMemo(() => {
    const s = search.trim().toLowerCase();
    return PERMISSION_CATALOG.filter(
      (m) => !s || m.label.toLowerCase().includes(s),
    );
  }, [search]);

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search modules…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {modules.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          No modules match your search.
        </div>
      ) : (
        <div className="space-y-3">
          {modules.map((m) => {
            const current = computeModuleLevel({
              enabledIds,
              catalog: m,
              keyToId,
            });

            return (
              <div key={m.moduleKey} className="border rounded-lg p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="font-semibold">{m.label}</div>

                  <div className="flex items-center gap-2">
                    {LEVELS.map((lvl) => (
                      <Button
                        key={lvl.value}
                        size="sm"
                        variant={
                          current === lvl.value ? "default" : "secondary"
                        }
                        onClick={() =>
                          setModuleLevel({
                            level: lvl.value,
                            catalog: m,
                            keyToId,
                            onToggle,
                          })
                        }
                      >
                        {lvl.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="mt-2 text-xs text-muted-foreground">
                  View = read-only • Manage = create/update • Admin =
                  delete/approve/refund/issue
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
