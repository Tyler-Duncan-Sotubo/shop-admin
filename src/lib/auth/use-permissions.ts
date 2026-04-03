import { useSession } from "next-auth/react";
import { useMemo } from "react";

export function parsePermissions(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as string[];
    } catch {
      return [];
    }
  }
  return [];
}

export function useAuthPermissions() {
  const { data: session, status } = useSession();

  const permissions = useMemo(
    () => parsePermissions(session?.permissions),
    [session?.permissions],
  );

  return { permissions, status, session };
}
