import { AxiosInstance } from "axios";
import { UserInviteValues } from "../schema/user.schema";

// Fetch list of users
export async function fetchUsers(axios: AxiosInstance) {
  const res = await axios.get("/api/auth/company-users");
  return res.data.data;
}

export async function fetchUserRoles(axios: AxiosInstance) {
  const res = await axios.get("/api/permissions/company/roles");
  return res.data.data;
}

// Invite user (create)
export async function inviteUser(
  axios: AxiosInstance,
  payload: UserInviteValues
) {
  const res = await axios.post("/api/auth/invite", payload);
  return res.data;
}

// Update user role (edit)
export async function updateUserRole(
  axios: AxiosInstance,
  userId: string,
  payload: Pick<UserInviteValues, "companyRoleId">
) {
  const res = await axios.patch(`/api/auth/edit-user-role/${userId}`, payload);
  return res.data;
}
