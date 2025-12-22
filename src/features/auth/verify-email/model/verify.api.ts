import { axiosInstance } from "@/shared/api/axios";
import { VerifyEmailFormValues } from "./verify-schema";

// ---- Verify email request ----
export async function apiVerifyEmail(values: VerifyEmailFormValues) {
  return axiosInstance.post("/api/auth/verify-email", values);
}

// ---- Resend verification code request ----
export async function apiResendVerification() {
  return axiosInstance.post("/api/auth/verify-email/resend");
}
