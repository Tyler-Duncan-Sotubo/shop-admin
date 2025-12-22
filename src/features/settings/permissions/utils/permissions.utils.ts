import { Permission } from "../types/permissions.type";

export function formatRoleName(name: string): string {
  return name
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function groupPermissions(permissions: Permission[]) {
  const grouped: Record<string, { id: string; key: string; label: string }[]> =
    {};

  for (const perm of permissions) {
    const [moduleRaw, ...rest] = perm.key.split(".");
    const moduleName = moduleRaw
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    const label = rest
      .map((part) =>
        part
          .split("_")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
      )
      .join(": ");

    if (!grouped[moduleName]) grouped[moduleName] = [];
    grouped[moduleName].push({ id: perm.id, key: perm.key, label });
  }

  return grouped;
}
