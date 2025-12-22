"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { isAxiosError } from "@/shared/api/axios";
import { getErrorMessage } from "@/shared/utils/get-error-message";
import { newPasswordSchema } from "@/features/auth/forgot-password/model/password.schema";
import { apiResetPassword } from "./reset-password.api";

export type NewPasswordFormValues = z.infer<typeof newPasswordSchema>;

export function useResetPassword(token: string) {
  const axiosInstance = useAxiosAuth();
  const router = useRouter();
  const [error, setError] = useState("");

  const resetPassword = async (values: NewPasswordFormValues) => {
    setError("");

    try {
      const res = await apiResetPassword(axiosInstance, {
        password: values.password,
        passwordConfirmation: values.password_confirmation,
        token,
      });

      if (res.status === 200) {
        router.push(`${process.env.NEXT_PUBLIC_CLIENT_URL}/login`);
      }
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        const message =
          err.response.data?.message ?? getErrorMessage(err.response.data);
        setError(message);
      } else {
        setError(getErrorMessage(err));
      }
    }
  };

  return {
    error,
    resetPassword,
  };
}
