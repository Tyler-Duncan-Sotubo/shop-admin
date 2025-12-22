// src/shared/api/auth/reset-password.ts
import { AxiosInstance } from "axios";

export interface ResetPasswordPayload {
  password: string;
  passwordConfirmation: string;
  token: string;
}

export async function apiResetPassword(
  axios: AxiosInstance,
  payload: ResetPasswordPayload
) {
  return axios.post("/api/auth/reset-password", payload);
}
