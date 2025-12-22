"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { loginApi } from "./login.api";
import { getErrorMessage } from "@/shared/utils/get-error-message";
import { isAxiosError } from "@/shared/api/axios";

export const useLogin = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (email: string, password: string) => {
    setError(null);
    try {
      // 1) Backend login
      const data = await loginApi.customLogin({ email, password });

      if ("error" in data && data.error) {
        setError(data.error);
        return;
      }

      // 2) 2FA branch
      if ("tempToken" in data && data.tempToken) {
        router.push(
          `/2fa?token=${data.tempToken}&email=${encodeURIComponent(email)}`
        );
        return;
      }

      // 3) Normal branch → NextAuth signIn
      const signInResult = await signIn("credentials", {
        redirect: false,
        user: JSON.stringify(data.user),
        backendTokens: JSON.stringify(data.backendTokens),
        permissions: JSON.stringify(data.permissions),
        checklist: JSON.stringify(data.checklist),
      });

      if (signInResult?.error) {
        setError(signInResult.error);
        return {
          error: getErrorMessage(signInResult.error),
        };
      }

      if (signInResult?.ok) {
        router.push("/dashboard");
      }
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        const message = err.response.data?.message;
        setError(message);
        return { error: getErrorMessage(message) };
      } else {
        setError("Something went wrong. Please try again.");
        return { error: getErrorMessage(err) };
      }
    }
  };

  return {
    login: handleLogin,
    error,
  };
};
