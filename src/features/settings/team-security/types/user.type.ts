export type UserRole = "owner" | "manager" | "staff" | "support";

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  avatar?: string | null;
  role: UserRole;
  companyRoleId: UserRole;
  status?: "active" | "inactive" | "invited";
  lastLogin?: string | null;
}

export type RoleRow = {
  name: string;
  description: string;
};
