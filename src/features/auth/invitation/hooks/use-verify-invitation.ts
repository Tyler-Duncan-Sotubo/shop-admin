"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { passwordResetSchema } from "../schema/password-reset.schema";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { isAxiosError } from "axios";
import { getErrorMessage } from "@/shared/utils/get-error-message";

type PasswordResetValues = z.infer<typeof passwordResetSchema>;

export function useVerifyInvitation(token: string) {
  const router = useRouter();
  const axiosInstance = useAxiosAuth();

  const [loading, setLoading] = useState(true); // initial verify loading
  const [error, setError] = useState("");

  const hasVerified = useRef(false);

  const form = useForm<PasswordResetValues>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      email: "",
      password: "",
      password_confirmation: "",
    },
  });

  useEffect(() => {
    if (!token) {
      setError("Invalid or expired invitation link.");
      setLoading(false);
      return;
    }

    if (hasVerified.current) return;
    hasVerified.current = true;

    const verifyInvite = async () => {
      console.log(`Verifying invite with token: ${token}`);
      try {
        const response = await axiosInstance.post("/api/auth/invite-user", {
          token,
        });

        if (response.data?.error) {
          throw new Error(response.data.error.message);
        }

        form.reset({
          email: response.data?.data?.email ?? "",
          password: "",
          password_confirmation: "",
        });
      } catch (err) {
        console.log(err);
        setError("Invalid or expired invitation.");
      } finally {
        setLoading(false);
      }
    };

    verifyInvite();
  }, [token, form, axiosInstance]);

  const onSubmit = useCallback(
    async (values: PasswordResetValues): Promise<void> => {
      // email is disabled but still validated; keep the guard anyway:
      if (!values.email || !values.password) {
        setError("Please enter both email and password");
        return;
      }

      setError("");

      try {
        const res = await axiosInstance.post(
          `/api/auth/invite-password-reset`,
          {
            password: values.password,
            passwordConfirmation: values.password_confirmation,
            token, // pass the token in the body instead of URL param
          },
          { withCredentials: true },
        );

        if (res.status === 200) {
          // Prefer relative path; no need for NEXT_PUBLIC_CLIENT_URL inside the client router push
          router.push("/login");
        }
      } catch (err) {
        if (isAxiosError(err) && err.response) {
          const msg = err.response.data?.message ?? "Failed to reset password";
          setError(getErrorMessage(msg));
          return;
        }

        setError(getErrorMessage(err));
      }
    },
    [axiosInstance, router, token],
  );

  const goHome = useCallback(() => router.push("/"), [router]);

  return useMemo(
    () => ({
      form,
      loading,
      error,
      onSubmit,
      goHome,
    }),
    [form, loading, error, onSubmit, goHome],
  );
}
