import { Permission } from "../types/permissions.type";
import {
  PermissionLevel,
  PermissionModuleCatalog,
} from "../config/permission-catalog";

export function buildKeyToIdMap(permissions: Permission[]) {
  const keyToId = new Map<string, string>();
  for (const p of permissions) keyToId.set(p.key, p.id);
  return keyToId;
}

export function keysToIds(keys: string[], keyToId: Map<string, string>) {
  return keys.map((k) => keyToId.get(k)).filter(Boolean) as string[];
}

export function computeModuleLevel(args: {
  enabledIds: Set<string>;
  catalog: PermissionModuleCatalog;
  keyToId: Map<string, string>;
}): PermissionLevel {
  const { enabledIds, catalog, keyToId } = args;

  const viewIds = new Set(keysToIds(catalog.levels.view, keyToId));
  const manageIds = new Set(keysToIds(catalog.levels.manage, keyToId));
  const adminIds = new Set(keysToIds(catalog.levels.admin, keyToId));

  const hasAny = (set: Set<string>) => {
    for (const id of set) if (enabledIds.has(id)) return true;
    return false;
  };
  const hasAll = (set: Set<string>) => {
    for (const id of set) if (!enabledIds.has(id)) return false;
    return true;
  };

  // ✅ Admin: any admin enabled OR everything else enabled (when admin set is empty)
  if (
    hasAny(adminIds) ||
    (adminIds.size === 0 && hasAll(viewIds) && hasAll(manageIds))
  )
    return "admin";

  // ✅ Manage: any manage enabled OR all view enabled
  if (hasAny(manageIds) || hasAll(viewIds)) return "manage";

  // ✅ View: any view enabled
  if (hasAny(viewIds)) return "view";

  return "none";
}

export function setModuleLevel(args: {
  level: PermissionLevel;
  catalog: PermissionModuleCatalog;
  keyToId: Map<string, string>;
  onToggle: (permId: string, checked: boolean) => void;
}) {
  const { level, catalog, keyToId, onToggle } = args;

  const viewIds = keysToIds(catalog.levels.view, keyToId);
  const manageIds = keysToIds(catalog.levels.manage, keyToId);
  const adminIds = keysToIds(catalog.levels.admin, keyToId);

  const allIds = Array.from(new Set([...viewIds, ...manageIds, ...adminIds]));

  // 1) clear module
  for (const id of allIds) onToggle(id, false);

  // 2) apply chosen level
  if (level === "view") {
    for (const id of viewIds) onToggle(id, true);
    return;
  }

  if (level === "manage") {
    for (const id of viewIds) onToggle(id, true);
    for (const id of manageIds) onToggle(id, true);
    return;
  }

  if (level === "admin") {
    for (const id of viewIds) onToggle(id, true);
    for (const id of manageIds) onToggle(id, true);
    for (const id of adminIds) onToggle(id, true);
    return;
  }

  // none: already cleared
}
