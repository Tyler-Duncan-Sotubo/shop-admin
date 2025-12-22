export type CompanyRole = {
  id: string;
  name: string;
};

export type Permission = {
  id: string;
  key: string; // e.g. "products.read"
};

export type PermissionSettingsResponse = {
  roles: CompanyRole[];
  permissions: Permission[];
  rolePermissions: Record<string, string[]>; // roleId -> permissionIds
};

export type UpdateCompanyPermissionsPayload = {
  rolePermissions: Record<string, string[]>;
};
