"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useResetPassword } from "../model/use-reset-password";
import {
  newPasswordSchema,
  newPasswordValues,
} from "../model/reset-password.schema";

const ResetPasswordForm = ({ token }: { token: string }) => {
  const { error, resetPassword } = useResetPassword(token);

  const form = useForm<newPasswordValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      password: "",
      password_confirmation: "",
    },
  });

  async function onSubmit(values: newPasswordValues) {
    await resetPassword(values);
  }

  return (
    <section className="w-full max-w-lg mx-auto p-6">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 px-6 py-6 w-full mx-auto"
        >
          <div>
            <h1 className="text-4xl font-bold">Reset Your Password</h1>
            <p className="text-gray-600 text-xl">
              Enter new password to reset your password.
            </p>
          </div>

          <div className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      {...field}
                      className="py-4"
                      isPassword
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password_confirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      {...field}
                      className="py-4"
                      isPassword
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {error && <FormError message={error} />}

          <Button
            type="submit"
            isLoading={form.formState.isSubmitting}
            className="w-full mt-6"
          >
            Reset Password
          </Button>
        </form>
      </Form>
    </section>
  );
};

export default ResetPasswordForm;
