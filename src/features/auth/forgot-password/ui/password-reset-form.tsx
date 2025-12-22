"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import FormError from "@/shared/ui/form-error";
import DividerWithText from "@/shared/ui/divider-with-text";
import { H3, P } from "@/shared/ui/typography";
import { usePasswordResetRequest } from "../model/use-password-reset-request";
import {
  requestPasswordResetSchema,
  requestPasswordResetSchemaType,
} from "../model/password.schema";

const PasswordResetForm = () => {
  const { error, success, sendPasswordResetRequest, resetState } =
    usePasswordResetRequest();

  const form = useForm<requestPasswordResetSchemaType>({
    resolver: zodResolver(requestPasswordResetSchema),
    defaultValues: {
      email: "",
    },
  });

  // 👇 onSubmit stays here in the form component
  async function onSubmit(values: requestPasswordResetSchemaType) {
    await sendPasswordResetRequest({ email: values.email });
  }

  if (success) {
    return (
      <section className="w-full max-w-lg mx-auto p-6">
        <H3 className="text-3xl font-bold text-center my-2">
          Password Reset Link Sent
        </H3>
        <P className="text-center text-gray-600 text-md">
          We have sent you an email with a link to reset your password. If you
          do not receive the email within a few minutes, please check your spam
          folder.
        </P>

        <div className="flex justify-center mt-4">
          <Button
            className="w-full"
            onClick={() => {
              resetState();
              form.reset();
            }}
          >
            Send Another Link
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-lg mx-auto p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="text-center">
            <H3 className="text-3xl font-bold my-2">Forgot Your Password?</H3>
            <P className="text-xl text-gray-600">We&apos;ve got you covered</P>
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    {...field}
                    leftIcon={
                      <Mail className="h-5 w-5 text-muted-foreground" />
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && <FormError message={error} />}

          <Button
            type="submit"
            isLoading={form.formState.isSubmitting}
            className="w-full"
          >
            Send Password Reset Link
          </Button>
        </form>
      </Form>

      <DividerWithText className="my-6" />
      <div className="text-md px-3 text-center">
        <Link href="/login">
          <Button
            variant="link"
            className="text-buttonPrimary font-bold text-sm"
          >
            Back to sign in
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default PasswordResetForm;
