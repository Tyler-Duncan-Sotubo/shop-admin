"use client";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import FormError from "@/shared/ui/form-error";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";

import { useVerifyInvitation } from "../hooks/use-verify-invitation";

export function VerifyInvitationView({ token }: { token: string }) {
  const { form, loading, error, onSubmit, goHome } = useVerifyInvitation(token);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-600">
            Verifying your invitation...
          </p>
          <p className="text-sm text-gray-500">
            Please wait while we confirm your access.
          </p>
        </div>
      </div>
    );
  }

  if (error && !form.getValues("email")) {
    // “hard error” state: token invalid before we could populate email
    return (
      <div className="flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-md text-center max-w-md">
          <h2 className="text-xl font-semibold">Invalid or Expired Token</h2>
          <p className="mt-2">
            The invitation link is either invalid or has expired. Please contact
            your administrator for a new invitation.
          </p>
          <Button onClick={goHome} className="mt-4 px-4 py-2 transition">
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <section className="flex flex-col mt-32 justify-between">
      <Form {...form}>
        <h1 className="text-2xl font-bold text-center">
          Your Invitation is Ready
        </h1>
        <p className="text-center text-gray-600 text-sm">
          Please set a new password to continue.
        </p>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 px-6 py-6 w-[70%] mx-auto"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input type="email" {...field} disabled />
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

          {error && <FormError message={error} />}

          <Button
            type="submit"
            isLoading={form.formState.isSubmitting}
            className="w-full"
          >
            Reset Password
          </Button>
        </form>
      </Form>
    </section>
  );
}
