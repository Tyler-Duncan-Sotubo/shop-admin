// src/shared/api/auth/two-fa.ts
import { AxiosInstance } from "axios";

export interface VerifyCodePayload {
  code: string;
  tempToken: string | null;
}

export interface ResendCodePayload {
  tempToken: string | null;
}

export async function apiVerifyCode(
  axios: AxiosInstance,
  payload: VerifyCodePayload
) {
  return axios.post("/api/auth/verify-code", payload);
}

export async function apiResendCode(
  axios: AxiosInstance,
  payload: ResendCodePayload
) {
  return axios.post("/api/auth/resend-code", payload);
}
