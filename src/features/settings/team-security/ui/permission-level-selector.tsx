"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";
import { cn } from "@/lib/utils";

export type Permission = { id: string; key: string };

type Level = "view" | "manage" | "admin";

type Props = {
  permissions: Permission[];
  value: string[];
  onChange: (next: string[]) => void;
  moduleOrder?: string[];
  disabledModules?: string[];
  className?: string;
};

export function PermissionSwitchSelector({
  permissions,
  value,
  onChange,
  moduleOrder,
  disabledModules = [],
  className,
}: Props) {
  const [search, setSearch] = React.useState("");
  const selected = React.useMemo(() => new Set(value), [value]);

  const grouped = React.useMemo(() => {
    // module -> { view:Set, manage:Set, all:Set }
    const map: Record<
      string,
      { view: Set<string>; manage: Set<string>; all: Set<string> }
    > = {};

    for (const p of permissions) {
      const moduleName = toTitleCase(p.key.split(".")[0] ?? "Other");

      if (!map[moduleName]) {
        map[moduleName] = {
          view: new Set(),
          manage: new Set(),
          all: new Set(),
        };
      }

      map[moduleName].all.add(p.id);

      const lvl = classifyPermissionKey(p.key);
      if (lvl === "view") map[moduleName].view.add(p.id);
      else map[moduleName].manage.add(p.id); // manage + unknown go here
    }

    return map;
  }, [permissions]);

  const modules = React.useMemo(() => {
    const all = Object.keys(grouped);

    const ordered = moduleOrder?.length
      ? [
          ...moduleOrder.map(toTitleCase).filter((m) => all.includes(m)),
          ...all
            .filter((m) => !new Set(moduleOrder.map(toTitleCase)).has(m))
            .sort(),
        ]
      : all.sort();

    const s = search.trim().toLowerCase();
    if (!s) return ordered;
    return ordered.filter((m) => m.toLowerCase().includes(s));
  }, [grouped, moduleOrder, search]);

  const getGroup = React.useCallback(
    (moduleName: string) => {
      const g = grouped[moduleName];
      if (!g) {
        return {
          viewGroup: new Set<string>(),
          manageGroup: new Set<string>(),
          adminGroup: new Set<string>(),
        };
      }

      // If module has no "view" keys, treat view as "any access" fallback.
      const viewGroup = g.view.size > 0 ? g.view : g.all;

      // Manage = view + manage (if view empty, falls back to all via viewGroup)
      const manageGroup = union(viewGroup, g.manage);

      // Admin = all permissions in module (THIS fixes your admin switch issue)
      const adminGroup = g.all;

      return { viewGroup, manageGroup, adminGroup };
    },
    [grouped],
  );

  const isChecked = React.useCallback(
    (moduleName: string, level: Level) => {
      const { viewGroup, manageGroup, adminGroup } = getGroup(moduleName);

      if (level === "admin")
        return isSuperset(selected, adminGroup) && adminGroup.size > 0;
      if (level === "manage")
        return isSuperset(selected, manageGroup) && manageGroup.size > 0;
      return isSuperset(selected, viewGroup) && viewGroup.size > 0;
    },
    [getGroup, selected],
  );

  const setLevel = React.useCallback(
    (moduleName: string, level: Level, checked: boolean) => {
      const { viewGroup, manageGroup, adminGroup } = getGroup(moduleName);
      const next = new Set(selected);

      const addAll = (ids: Set<string>) => ids.forEach((id) => next.add(id));
      const delAll = (ids: Set<string>) => ids.forEach((id) => next.delete(id));

      if (level === "view") {
        if (checked) {
          addAll(viewGroup);
        } else {
          // turning off view disables entire module
          delAll(adminGroup);
        }
      }

      if (level === "manage") {
        if (checked) {
          addAll(manageGroup); // implies view
        } else {
          // manage off removes manage but keeps view (and removes admin)
          delAll(adminGroup);
          addAll(viewGroup);
        }
      }

      if (level === "admin") {
        if (checked) {
          addAll(adminGroup); // full access (all)
        } else {
          // admin off drops to manage (or view if no manage keys)
          delAll(adminGroup);
          addAll(manageGroup);
        }
      }

      onChange(Array.from(next));
    },
    [getGroup, selected, onChange],
  );

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Role permissions</CardTitle>
        <div className="mt-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search modules…"
            className="max-w-sm"
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Header row */}
        <div className="hidden md:grid grid-cols-[1fr_120px_120px_120px] gap-2 px-3 text-xs text-muted-foreground">
          <div>Module</div>
          <div className="text-center">View</div>
          <div className="text-center">Manage</div>
          <div className="text-center">Admin</div>
        </div>

        {modules.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No modules match your search.
          </div>
        ) : (
          modules.map((moduleName) => {
            const g = grouped[moduleName];
            const disabled = disabledModules
              .map(toTitleCase)
              .includes(moduleName);

            const viewOn = isChecked(moduleName, "view");
            const manageOn = isChecked(moduleName, "manage");
            const adminOn = isChecked(moduleName, "admin");

            const countSelected = g ? countIntersection(selected, g.all) : 0;
            const countAll = g?.all.size ?? 0;

            return (
              <div
                key={moduleName}
                className="grid grid-cols-1 md:grid-cols-[1fr_120px_120px_120px] gap-2 rounded-lg border p-3 items-center"
              >
                {/* Module cell */}
                <div className="flex items-center justify-between md:block">
                  <div className="font-medium">{moduleName}</div>
                  <div className="text-xs text-muted-foreground md:mt-1">
                    {countSelected}/{countAll} selected
                  </div>
                </div>

                {/* Switch cells */}
                <div className="flex md:justify-center justify-between items-center">
                  <span className="md:hidden text-sm text-muted-foreground">
                    View
                  </span>
                  <Switch
                    checked={viewOn}
                    disabled={disabled}
                    onCheckedChange={(checked) =>
                      setLevel(moduleName, "view", checked)
                    }
                  />
                </div>

                <div className="flex md:justify-center justify-between items-center">
                  <span className="md:hidden text-sm text-muted-foreground">
                    Manage
                  </span>
                  <Switch
                    checked={manageOn}
                    disabled={disabled || adminOn}
                    onCheckedChange={(checked) =>
                      setLevel(moduleName, "manage", checked)
                    }
                  />
                </div>

                <div className="flex md:justify-center justify-between items-center">
                  <span className="md:hidden text-sm text-muted-foreground">
                    Admin
                  </span>
                  <Switch
                    checked={adminOn}
                    disabled={disabled}
                    onCheckedChange={(checked) =>
                      setLevel(moduleName, "admin", checked)
                    }
                  />
                </div>

                {disabled ? (
                  <div className="md:col-span-4 text-xs text-muted-foreground">
                    This module is locked by policy.
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

/* =========================
   Helpers
   ========================= */

function classifyPermissionKey(key: string): "view" | "manage" | "unknown" {
  // We no longer need a separate "admin" bucket.
  // Admin = "all permissions in module" (reliable and intuitive)

  const tail = key.split(".").slice(1).join(".").toLowerCase();

  if (
    tail === "read" ||
    tail.endsWith(".read") ||
    tail.includes("read") ||
    tail.includes("view")
  ) {
    return "view";
  }

  if (
    tail.includes("create") ||
    tail.includes("update") ||
    tail.includes("delete") ||
    tail.includes("publish") ||
    tail.includes("refund") ||
    tail.includes("cancel") ||
    tail.includes("capture") ||
    tail.includes("upload") ||
    tail.includes("moderate") ||
    tail.includes("adjust") ||
    tail.includes("write") ||
    tail.includes("invite") ||
    tail.includes("preview") ||
    tail.includes("generate") ||
    tail.includes("confirm") ||
    tail.includes("allocate") ||
    tail.includes("manage") || // treat "manage" keys as manage-level now
    tail.includes("approve") ||
    tail.includes("issue") ||
    tail.includes("void") ||
    tail.includes("assign") ||
    tail.includes("transfer") ||
    tail.includes("recalculate") ||
    tail.includes("complete")
  ) {
    return "manage";
  }

  return "unknown";
}

function toTitleCase(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function union(a: Set<string>, b: Set<string>) {
  const out = new Set<string>(a);
  b.forEach((x) => out.add(x));
  return out;
}

function isSuperset(set: Set<string>, subset: Set<string>) {
  for (const x of subset) if (!set.has(x)) return false;
  return true;
}

function countIntersection(a: Set<string>, b: Set<string>) {
  let n = 0;
  for (const x of b) if (a.has(x)) n++;
  return n;
}
