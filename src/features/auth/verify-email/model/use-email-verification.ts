import { useState } from "react";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { VerifyEmailFormValues } from "./verify-schema";
import { getErrorMessage } from "@/shared/utils/get-error-message";
import { apiResendVerification, apiVerifyEmail } from "./verify.api";

export function useEmailVerification() {
  const [error, setError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const router = useRouter();

  async function verifyEmail(values: VerifyEmailFormValues) {
    setError(null);

    try {
      const res = await apiVerifyEmail(values);

      if (res.status === 201) {
        toast("Email verified successfully!");
        router.push("/auth/login");
      }
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        setError(error.response.data.error.message);
      } else {
        setError(getErrorMessage(error));
      }
    }
  }

  async function resendVerification() {
    setError(null);
    setIsResending(true);

    try {
      const res = await apiResendVerification();

      if (res.status === 200) {
        toast.success("A new verification code has been sent to your email.");
      } else {
        toast.error("Unable to resend code. Please try again.");
      }
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        toast.error(
          error.response.data?.error?.message ??
            "Failed to resend verification code."
        );
      } else {
        toast.error(getErrorMessage(error));
      }
    } finally {
      setIsResending(false);
    }
  }

  return {
    error,
    isResending,
    verifyEmail,
    resendVerification,
  };
}
