"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { axiosInstance } from "@/shared/api/axios";
import { isAxiosError } from "@/shared/api/axios";
import { getErrorMessage } from "@/shared/utils/get-error-message";
import { apiResetPassword } from "./reset-password.api";
import { newPasswordSchema } from "./reset-password.schema";

export type NewPasswordFormValues = z.infer<typeof newPasswordSchema>;

export function useResetPassword(token: string) {
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
        router.push("/login");
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
