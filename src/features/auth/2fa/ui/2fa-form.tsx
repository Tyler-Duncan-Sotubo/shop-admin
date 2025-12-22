"use client";

import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import DividerWithText from "@/shared/ui/divider-with-text";
import { H3, P } from "@/shared/ui/typography";
import { useTwoFa } from "../model/use-two-fa";

export default function TwoFaForm() {
  const searchParams = useSearchParams();
  const tempToken = searchParams.get("token");
  const email = searchParams.get("email");

  const {
    verifyError,
    resendError,
    resendVisible,
    isResending,
    verifyCode,
    resendCode,
  } = useTwoFa(tempToken);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<{ code: string }>();

  // 👇 onSubmit stays in the form component
  const handleCodeSubmit = async (values: { code: string }) => {
    await verifyCode(values.code);
  };

  const handleResendCode = async () => {
    await resendCode();
  };

  return (
    <div>
      <H3 className="text-3xl font-bold my-4 text-center">Hold up.</H3>
      <P className="text-center mb-6 text-sm">
        Protecting your account is one of our top priorities!
        <br />
        Please confirm your account by entering the authentication code sent to:
        <span className="font-semibold"> {email}</span>
      </P>

      <form
        onSubmit={handleSubmit(handleCodeSubmit)}
        className="space-y-4 sm:w-[70%] w-full mx-auto"
      >
        <Input
          type="text"
          placeholder="Enter 6-digit code"
          className="h-12 text-lg"
          {...register("code", { required: true, minLength: 6, maxLength: 6 })}
        />

        {verifyError && <p className="text-red-500 text-sm">{verifyError}</p>}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Verifying..." : "Verify Code"}
        </Button>
      </form>

      <div className="text-center text-sm mt-6">
        <P>It may take a few minutes to receive your code.</P>
        <DividerWithText className="my-4" />
        {!resendVisible ? (
          <Button
            variant="link"
            onClick={handleResendCode}
            className="text-blue-500 font-semibold text-sm"
            type="button"
            disabled={isResending}
          >
            {isResending ? "Sending..." : "Send me a new code"}
          </Button>
        ) : (
          <p className="text-green-600 font-semibold">
            Code resent successfully.
          </p>
        )}
        {resendError && (
          <p className="text-red-500 text-sm mt-2">{resendError}</p>
        )}
      </div>
    </div>
  );
}
