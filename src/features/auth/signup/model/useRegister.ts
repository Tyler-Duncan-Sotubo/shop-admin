"use client";

import { isAxiosError } from "@/shared/api/axios";
import { getErrorMessage } from "@/shared/utils/get-error-message";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { RegisterValues } from "./register.schema";
import { registerApi } from "./register.api";

export const useRegister = () => {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const register = async (values: RegisterValues) => {
    const slug = values.companyName.trim().toLowerCase().replace(/\s+/g, "-");
    try {
      const res = await registerApi.register(values, slug);

      if (res.status === 201) {
        toast.success("Account Created");
        router.push("/verify-email");
      }
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        setError(err.response.data?.error?.message ?? "Registration failed");
        return {
          error: getErrorMessage(err.response.data?.error?.message),
        };
      } else {
        return { error: getErrorMessage(err) };
      }
    }
  };

  return { register, error };
};
