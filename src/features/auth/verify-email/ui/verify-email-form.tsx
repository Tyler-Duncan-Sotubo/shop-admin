"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/shared/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/shared/ui/input-otp";
import FormError from "@/shared/ui/form-error";
import { Button } from "@/shared/ui/button";
import {
  VerifyEmailFormSchema,
  VerifyEmailFormValues,
} from "../model/verify-schema";
import { useEmailVerification } from "../model/use-email-verification";

function VerifyEmailForm() {
  const { error, isResending, verifyEmail, resendVerification } =
    useEmailVerification();

  const form = useForm<VerifyEmailFormValues>({
    resolver: zodResolver(VerifyEmailFormSchema),
    defaultValues: {
      token: "",
    },
  });

  async function onSubmit(values: VerifyEmailFormValues) {
    await verifyEmail(values);
  }

  async function handleResend() {
    await resendVerification();
  }

  return (
    <section className="flex flex-col items-center justify-center p-6">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-xl font-semibold">
            Verify Your Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600">
            We have sent a 6-digit verification code to your email. Enter it
            below to continue.
          </p>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 flex flex-col justify-center items-center"
            >
              <FormField
                control={form.control}
                name="token"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <InputOTP
                        {...field}
                        maxLength={6}
                        containerClassName="justify-center"
                        className="text-xl tracking-widest"
                      >
                        <InputOTPGroup>
                          {[...Array(6)].map((_, index) => (
                            <React.Fragment key={index}>
                              <InputOTPSlot index={index} />
                              {index === 2 && <InputOTPSeparator />}
                            </React.Fragment>
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && <FormError message={error} />}

              <Button
                type="submit"
                className="w-full"
                isLoading={form.formState.isSubmitting}
              >
                Verify Email
              </Button>
            </form>
          </Form>

          {/* Resend OTP */}
          <p className="text-center text-sm text-gray-500">
            Didn’t receive a code?{" "}
            <button
              className="text-blue-600 hover:underline disabled:opacity-50"
              onClick={handleResend}
              type="button"
              disabled={isResending}
            >
              {isResending ? "Resending..." : "Resend"}
            </button>
          </p>
        </CardContent>
      </Card>
    </section>
  );
}

export default VerifyEmailForm;
