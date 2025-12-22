import { AxiosInstance } from "axios";

export interface RequestPasswordResetPayload {
  email: string;
}

export async function apiRequestPasswordReset(
  axios: AxiosInstance,
  payload: RequestPasswordResetPayload
) {
  return axios.post("/api/auth/password-reset", payload, {
    withCredentials: true,
  });
}
