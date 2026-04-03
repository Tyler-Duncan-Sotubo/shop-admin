import { useMemo } from "react";

export function useProductPermissions(permissions: string[]) {
  return useMemo(() => {
    const permSet = new Set(permissions);
    const has = (key: string) => permSet.has(key);

    return {
      canRead: has("products.read"),
      canCreate: has("products.create"),
      canUpdate: has("products.update"),
      canDelete: has("products.delete"),
      canPublish: has("products.publish"),
      canManageMedia: has("products.manage_media"),
      canManageSEO: has("products.manage_seo"),
    };
  }, [permissions]);
}
