"use client";

import { useMemo, useState } from "react";
import { Checkbox } from "@/shared/ui/checkbox";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Permission } from "../types/permissions.type";
import { groupPermissions } from "../utils/permissions.utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";

type Props = {
  permissions: Permission[];
  selectedRoleId: string | null;
  rolePermissions: Record<string, string[]>;
  onToggle: (permId: string, checked: boolean) => void;
};

export function PermissionsGrid({
  permissions,
  selectedRoleId,
  rolePermissions,
  onToggle,
}: Props) {
  const [search, setSearch] = useState("");
  const [showEnabledOnly, setShowEnabledOnly] = useState(false);

  const enabledPerms = useMemo(
    () => new Set(selectedRoleId ? rolePermissions[selectedRoleId] ?? [] : []),
    [rolePermissions, selectedRoleId]
  );

  const grouped = useMemo(() => groupPermissions(permissions), [permissions]);

  const filteredGrouped = useMemo(() => {
    const result: typeof grouped = {};
    const s = search.trim().toLowerCase();

    for (const [module, perms] of Object.entries(grouped)) {
      const filtered = perms.filter((p) => {
        const matchesSearch =
          !s ||
          module.toLowerCase().includes(s) ||
          p.label.toLowerCase().includes(s);

        const isEnabled = enabledPerms.has(p.id);

        return matchesSearch && (!showEnabledOnly || isEnabled);
      });

      if (filtered.length) result[module] = filtered;
    }

    return result;
  }, [grouped, search, showEnabledOnly, enabledPerms]);

  const moduleEntries = useMemo(
    () => Object.entries(filteredGrouped),
    [filteredGrouped]
  );

  // ✅ open only first 3 modules by default, everything else closed
  const defaultOpenValues = useMemo(() => {
    return moduleEntries.slice(0, 3).map(([moduleName]) => moduleName);
  }, [moduleEntries]);

  if (!selectedRoleId) {
    return (
      <div className="w-3/4 text-muted-foreground">
        Select a role to edit permissions.
      </div>
    );
  }

  return (
    <div className="w-3/4 space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-3">
        <Input
          placeholder="Search permissions…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />

        <Label className="flex items-center gap-2 text-sm w-1/2">
          <Checkbox
            checked={showEnabledOnly}
            onCheckedChange={(v) => setShowEnabledOnly(Boolean(v))}
          />
          Show enabled only
        </Label>
      </div>

      {/* Modules (Accordion) */}
      {moduleEntries.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          No permissions match your filters.
        </div>
      ) : (
        <Accordion
          type="multiple"
          defaultValue={defaultOpenValues}
          className="space-y-3 my-2"
        >
          {moduleEntries.map(([moduleName, perms]) => {
            const enabledCount = perms.reduce(
              (acc, p) => acc + (enabledPerms.has(p.id) ? 1 : 0),
              0
            );

            return (
              <AccordionItem
                key={moduleName}
                value={moduleName}
                className="border rounded-lg px-2"
              >
                <AccordionTrigger className="px-2">
                  <div className="flex w-full items-center justify-between pr-2">
                    <div className="font-semibold">{moduleName}</div>
                    <div className="text-sm text-muted-foreground">
                      {enabledCount}/{perms.length}
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-2 pb-3">
                  {/* Module actions */}
                  <div className="flex gap-2 mb-3">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => perms.forEach((p) => onToggle(p.id, true))}
                    >
                      Select all
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        perms.forEach((p) => onToggle(p.id, false))
                      }
                    >
                      Clear
                    </Button>
                  </div>

                  {/* Permissions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
                    {perms.map((perm) => {
                      const checked = enabledPerms.has(perm.id);

                      return (
                        <Label
                          key={perm.id}
                          className="flex items-start gap-3 p-3 border rounded-md hover:bg-accent/50"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(v) =>
                              onToggle(perm.id, Boolean(v))
                            }
                          />
                          <span className="text-sm font-medium">
                            {perm.label}
                          </span>
                        </Label>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
}
