import { useMemo } from "react";

export function useCategoryPermissions(permissions: string[]) {
  const permSet = useMemo(() => new Set(permissions), [permissions]);
  const has = (key: string) => permSet.has(key);

  return {
    canRead: has("categories.read"),
    canCreate: has("categories.create"),
    canUpdate: has("categories.update"),
    canDelete: has("categories.delete"),
  };
}
