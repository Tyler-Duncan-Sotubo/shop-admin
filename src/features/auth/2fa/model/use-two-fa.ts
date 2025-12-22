"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { isAxiosError } from "@/shared/api/axios";
import { getErrorMessage } from "@/shared/utils/get-error-message";
import { apiResendCode, apiVerifyCode } from "./two-fa.api";

export function useTwoFa(tempToken: string | null) {
  const axiosInstance = useAxiosAuth();
  const router = useRouter();

  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendVisible, setResendVisible] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const verifyCode = async (code: string) => {
    setVerifyError(null);

    try {
      const res = await apiVerifyCode(axiosInstance, { code, tempToken });
      const data = res.data;

      if (data.status === "error") {
        setVerifyError("Invalid code");
        console.error("Verification error payload:", data);
        return;
      }

      const signInRes = await signIn("credentials", {
        redirect: false,
        user: JSON.stringify(data.data.user),
        backendTokens: JSON.stringify(data.data.backendTokens),
        permissions: JSON.stringify(data.data.permissions),
      });

      if (signInRes?.error) {
        console.error("signIn error:", signInRes.error);
        setVerifyError(signInRes.error);
        return;
      }

      router.push("/dashboard");
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        setVerifyError(
          error.response.data?.error?.message ?? "Verification failed"
        );
      } else {
        console.error("Verification unknown error:", error);
        setVerifyError(getErrorMessage(error));
      }
    }
  };

  const resendCode = async () => {
    setResendError(null);
    setResendVisible(false);
    setIsResending(true);

    try {
      const res = await apiResendCode(axiosInstance, { tempToken });
      const data = res.data;

      if (data.status === "error") {
        setResendError(data.message ?? "Failed to resend code");
        return;
      }

      if (data.status === "success") {
        setResendVisible(true);
        setResendError(null);
      }
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        setResendError(
          error.response.data?.error?.message ?? "Failed to resend code"
        );
      } else {
        setResendError(getErrorMessage(error));
      }
    } finally {
      setIsResending(false);
    }
  };

  return {
    verifyError,
    resendError,
    resendVisible,
    isResending,
    verifyCode,
    resendCode,
  };
}
