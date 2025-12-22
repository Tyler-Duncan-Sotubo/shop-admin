"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/shared/ui/form";
import FormError from "@/shared/ui/form-error";
import Loading from "@/shared/ui/loading";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group";

import { CompanyAccount } from "../types/company-account.type";
import { useCompanyAccount } from "../hooks/use-company-settings";
import {
  CompanyAccountSchema,
  CompanyAccountValues,
} from "../schema/company.schema";
import {
  currencyOptions,
  defaultLocaleOptions,
  timezoneOptions,
} from "../config/general-settings.config";

function mapCompanyToForm(company: CompanyAccount): CompanyAccountValues {
  return {
    name: company.name,
    slug: company.slug,
    legalName: company.legalName ?? "",
    country: company.country ?? "",
    vatNumber: company.vatNumber ?? "",
    defaultCurrency: company.defaultCurrency ?? "",
    timezone: company.timezone ?? "",
    defaultLocale: company.defaultLocale ?? "",
    billingEmail: company.billingEmail ?? "",
    plan: company.plan,
  };
}

export default function CompanyAccountSection() {
  const { company, isLoading, fetchError, updateCompany } = useCompanyAccount();

  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<CompanyAccountValues>({
    resolver: zodResolver(CompanyAccountSchema),
    defaultValues: {
      name: "",
      slug: "",
      legalName: "",
      country: "",
      vatNumber: "",
      defaultCurrency: "",
      timezone: "",
      defaultLocale: "",
      billingEmail: "",
      plan: "",
    },
    mode: "onChange",
  });

  // Populate form when company loads
  useEffect(() => {
    if (company) {
      form.reset(mapCompanyToForm(company));
    }
  }, [company, form]);

  async function onSubmit(values: CompanyAccountValues) {
    setSubmitError(null);

    await updateCompany(
      {
        slug: values.slug,
        legalName: values.legalName || null,
        vatNumber: values.vatNumber || null,
        defaultCurrency: values.defaultCurrency,
        timezone: values.timezone,
        defaultLocale: values.defaultLocale,
        billingEmail: values.billingEmail || null,
        plan: values.plan,
      },
      setSubmitError
    );
  }

  if (isLoading && !company) {
    return <Loading />;
  }

  if (fetchError && !company) {
    return (
      <p className="text-sm text-destructive">
        Failed to load company: {fetchError}
      </p>
    );
  }

  return (
    <section>
      <div className="w-full max-w-2xl space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Identity */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Company Slug</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    Used in URLs and internal references. Must be unique.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="legalName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Legal Name</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    Registered legal entity name, used on invoices and tax
                    forms.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      {...field}
                      value={field.value ?? ""}
                      disabled
                      className="capitalize"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vatNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax / VAT Number</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    VAT, TIN or other tax registration number if applicable.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Localization */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Localization</h2>

              {/* Currency radio group */}
              <FormField
                control={form.control}
                name="defaultCurrency"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel required>Default Currency</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col space-y-2"
                      >
                        {currencyOptions.map((option) => (
                          <FormItem
                            key={option.value}
                            className="flex items-center space-x-3 space-y-0"
                          >
                            <FormControl>
                              <RadioGroupItem value={option.value} />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {option.label}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Timezone radio group */}
              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel required>Timezone</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col space-y-2"
                      >
                        {timezoneOptions.map((option) => (
                          <FormItem
                            key={option.value}
                            className="flex items-center space-x-3 space-y-0"
                          >
                            <FormControl>
                              <RadioGroupItem value={option.value} />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {option.label}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Default locale radio group */}
              <FormField
                control={form.control}
                name="defaultLocale"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel required>Default Locale</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col space-y-2"
                      >
                        {defaultLocaleOptions.map((option) => (
                          <FormItem
                            key={option.value}
                            className="flex items-center space-x-3 space-y-0"
                          >
                            <FormControl>
                              <RadioGroupItem value={option.value} />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {option.label}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Billing */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Billing</h2>

              <FormField
                control={form.control}
                name="billingEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      Invoices and receipts will be sent to this email.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="plan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} disabled />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      Plan changes are managed from the billing page.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {company?.trialEndsAt && (
                <p className="text-xs text-muted-foreground">
                  Trial ends:{" "}
                  {new Date(company.trialEndsAt).toLocaleDateString()}
                </p>
              )}
            </div>

            {(submitError || fetchError) && (
              <FormError message={submitError ?? String(fetchError)} />
            )}

            <Button
              type="submit"
              className="w-1/4"
              isLoading={form.formState.isSubmitting}
            >
              Save changes
            </Button>
          </form>
        </Form>
      </div>
    </section>
  );
}
