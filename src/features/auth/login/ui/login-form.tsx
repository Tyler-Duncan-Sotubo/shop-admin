"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Mail } from "lucide-react";
import FormError from "@/shared/ui/form-error";
import Link from "next/link";
import { H3, P } from "@/shared/ui/typography";
import { loginSchema } from "@/features/auth/login/model/login.schema";
import DividerWithText from "@/shared/ui/divider-with-text";
import { useLogin } from "../model/use-login";

function LoginForm() {
  const { login, error } = useLogin();
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    await login(values.email, values.password);
  }

  return (
    <section className="w-full max-w-lg mx-auto p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <H3 className="text-2xl font-semibold text-center">Welcome back</H3>
            <P className="text-center text-textSecondary">
              Log in to your account to continue
            </P>
          </div>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Email Address</FormLabel>
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
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      {...field}
                      className="py-2"
                      isPassword
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Display error message if there is one */}
            {error ? <FormError message={error} /> : ""}

            <section className="flex justify-end">
              <Link href="/forgot-password">
                <Button
                  variant="link"
                  className="text-buttonPrimary px-0 font-bold text-sm"
                >
                  Forgot password?
                </Button>
              </Link>
            </section>

            <div className="flex justify-end">
              <Button
                type="submit"
                isLoading={form.formState.isSubmitting}
                className="w-full"
              >
                Log In
              </Button>
            </div>
            <DividerWithText className="my-10" />
            <div className="text-center text-textSecondary text-md flex justify-center items-center space-x-1">
              <P>Don&apos;t have an account?</P>
              <Link href="/" target="_blank">
                <Button
                  variant="link"
                  className="text-buttonPrimary px-0 font-bold text-sm"
                  type="button"
                >
                  Book a demo
                </Button>
              </Link>
            </div>
          </div>
        </form>
      </Form>
    </section>
  );
}

export default LoginForm;
