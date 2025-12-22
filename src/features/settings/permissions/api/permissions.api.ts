import { AxiosInstance } from "axios";
import {
  PermissionSettingsResponse,
  UpdateCompanyPermissionsPayload,
} from "../types/permissions.type";

export async function fetchCompanyPermissions(
  axiosInstance: AxiosInstance
): Promise<PermissionSettingsResponse> {
  const res = await axiosInstance.get("/api/permissions/company-all");
  return res.data.data as PermissionSettingsResponse;
}

export async function updateCompanyPermissionsApi(
  axiosInstance: AxiosInstance,
  payload: UpdateCompanyPermissionsPayload,
  accessToken?: string
) {
  const res = await axiosInstance.patch("/api/permissions", payload, {
    headers: {
      Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
    },
  });
  return res.data;
}
