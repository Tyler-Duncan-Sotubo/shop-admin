import type { SearchScope } from "../hooks/use-global-search";
import { SEARCH_SCOPE_PERMISSIONS } from "../config/search-scope-permissions";

const LEAF_SCOPES: SearchScope[] = [
  "customers",
  "orders",
  "invoices",
  "quotes",
];

export function getAllowedSearchScopes(permissions: string[]): SearchScope[] {
  const allowedLeafScopes = LEAF_SCOPES.filter((scope) => {
    const requiredPermission = SEARCH_SCOPE_PERMISSIONS[scope];
    return requiredPermission
      ? permissions.includes(requiredPermission)
      : false;
  });

  if (allowedLeafScopes.length === 0) return [];

  return ["all", ...allowedLeafScopes];
}
