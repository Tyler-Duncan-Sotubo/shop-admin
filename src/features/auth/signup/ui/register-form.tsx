/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { Mail } from "lucide-react";
import { H3, P } from "@/shared/ui/typography";
import {
  RegisterSchema,
  RegisterValues,
} from "@/features/auth/signup/model/register.schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import DividerWithText from "@/shared/ui/divider-with-text";
import FormError from "@/shared/ui/form-error";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Progress } from "@/shared/ui/progress";
import { useRegister } from "../model/useRegister";

function RegisterForm() {
  const { register, error } = useRegister();
  const [stage, setStage] = useState<0 | 1>(0);
  const [stageError, setStageError] = useState<string | null>(null);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      passwordConfirmation: "",
      companyName: "",
      terms: true,
      allowMarketingEmails: true,
    },
    mode: "onSubmit",
    shouldUnregister: false,
  });

  // ✅ Now only checks step 1 fields: basic identity + company + terms
  function basicStageOneCheck(values: RegisterValues): string | null {
    const { firstName, lastName, email, companyName, terms } = values;

    if (
      !firstName?.trim() ||
      !lastName?.trim() ||
      !email?.trim() ||
      !companyName?.trim()
    ) {
      return "Please fill in all required fields.";
    }

    const emailOk = /\S+@\S+\.\S+/.test(email);
    if (!emailOk) return "Please enter a valid email address.";

    if (!terms) {
      return "You must accept the Privacy Policy to continue.";
    }

    return null;
  }

  async function handleNext() {
    setStageError(null);
    const values = form.getValues();

    const err = basicStageOneCheck(values);
    if (err) {
      setStageError(err);
      return;
    }
    setStage(1);
  }

  function handleBack() {
    setStageError(null);
    setStage(0);
  }

  async function onSubmit(values: RegisterValues) {
    await register(values);
  }

  const { control } = form;

  return (
    <section className="w-full max-w-xl mx-auto p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <H3 className="text-center">Create your account</H3>
          </div>

          {/* Simple stage indicator */}
          <Progress value={stage === 0 ? 50 : 100} className="h-2 w-full" />

          <div className="space-y-1">
            {stage === 0 && (
              <P className="text-center text-textSecondary mx-auto">
                Start your 21-day free trial. No credit card required.
              </P>
            )}
            {stage === 1 && (
              <P className="text-center text-textSecondary mx-auto">
                Choose a secure password for your account.
              </P>
            )}
          </div>

          {stage === 0 ? (
            <>
              {/* Step 1: User + company + terms + marketing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={control as any}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>First Name</FormLabel>
                      <FormControl>
                        <Input type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Last Name</FormLabel>
                      <FormControl>
                        <Input type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={control}
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
                control={control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Company Name</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <FormField
                  control={control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="terms"
                            checked={field.value}
                            onCheckedChange={(checked) =>
                              field.onChange(!!checked)
                            }
                          />
                          <label
                            htmlFor="terms"
                            className="text-md text-textPrimary font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            I accept the{" "}
                            <Link href="/privacy">
                              <Button
                                variant="link"
                                className="text-buttonPrimary px-0 font-bold"
                              >
                                Privacy Policy
                              </Button>
                            </Link>
                          </label>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="allowMarketingEmails"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="allowMarketingEmails"
                            checked={field.value}
                            onCheckedChange={(checked) =>
                              field.onChange(!!checked)
                            }
                          />
                          <label
                            htmlFor="allowMarketingEmails"
                            className="text-md text-textSecondary leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Send me product updates and occasional marketing
                            emails.
                          </label>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Local stage error (Next checks) */}
              {stageError ? <FormError message={stageError} /> : null}

              <div className="flex justify-end gap-3">
                <Button type="button" onClick={handleNext}>
                  Next
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <DividerWithText className="my-6" text="Password" />
              <FormField
                control={control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Password</FormLabel>
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
                control={control}
                name="passwordConfirmation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Confirm Password</FormLabel>
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

              {/* API/server error on final submit */}
              {error ? <FormError message={error} /> : null}

              <div className="flex justify-between">
                <Button type="button" variant="secondary" onClick={handleBack}>
                  Back
                </Button>
                <Button type="submit" isLoading={form.formState.isSubmitting}>
                  Start your 21-day free trial
                </Button>
              </div>
            </div>
          )}

          <DividerWithText className="my-6" />

          <P className="text-right text-textSecondary text-md">
            Already have an Account?{" "}
            <Link href="/login">
              <Button
                variant="link"
                className="text-buttonPrimary px-0 font-bold"
              >
                Login
              </Button>
            </Link>
          </P>
        </form>
      </Form>
    </section>
  );
}

export default RegisterForm;
