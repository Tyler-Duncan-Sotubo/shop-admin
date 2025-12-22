/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Card } from "@/shared/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";

import {
  InvoiceBrandingSchema,
  type InvoiceBrandingValues,
} from "../schema/invoice-branding.schema";
import type { InvoiceBranding } from "../types/invoice-template.type";

export function BrandingForm({
  initial,
  onSubmit,
  loading,
  isSubmitting,
}: {
  initial: InvoiceBranding | null | undefined;
  onSubmit: (values: InvoiceBrandingValues) => Promise<void>;
  loading?: boolean;
  isSubmitting?: boolean;
}) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<InvoiceBrandingValues>({
    resolver: zodResolver(InvoiceBrandingSchema),
    defaultValues: {
      templateId: null,
      logoUrl: null,
      primaryColor: null,
      supplierName: null,
      supplierAddress: null,
      supplierEmail: null,
      supplierPhone: null,
      supplierTaxId: null,
      bankDetails: { bankName: "", accountName: "", accountNumber: "" },
      footerNote: null,
    },
  });

  useEffect(() => {
    if (loading) return;

    form.reset(
      {
        templateId: initial?.templateId ?? null,
        logoUrl: initial?.logoUrl ?? null,
        primaryColor: initial?.primaryColor ?? null,
        supplierName: initial?.supplierName ?? null,
        supplierAddress: initial?.supplierAddress ?? null,
        supplierEmail: initial?.supplierEmail ?? null,
        supplierPhone: initial?.supplierPhone ?? null,
        supplierTaxId: initial?.supplierTaxId ?? null,
        bankDetails: {
          bankName: initial?.bankDetails?.bankName ?? "",
          accountName: initial?.bankDetails?.accountName ?? "",
          accountNumber: initial?.bankDetails?.accountNumber ?? "",
        },
        footerNote: initial?.footerNote ?? null,
      },
      { keepErrors: false }
    );
  }, [initial, loading, form]);

  const handleSubmit = async (values: InvoiceBrandingValues) => {
    try {
      setSubmitError(null);
      await onSubmit(values);
    } catch (err: any) {
      setSubmitError(err?.message ?? "Failed to update invoice branding");
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
        <Card className="p-4 space-y-4">
          <p className="text-sm font-semibold">Branding</p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              name="supplierName"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Supplier name</FormLabel>
                  <FormControl>
                    <Input
                      className="h-12"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
                      placeholder="Your Company Ltd"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="supplierEmail"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billing email</FormLabel>
                  <FormControl>
                    <Input
                      className="h-12"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
                      placeholder="billing@yourco.com"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            name="supplierAddress"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Supplier address</FormLabel>
                <FormControl>
                  <Textarea
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value || null)}
                    placeholder="Company Address"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              name="supplierPhone"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input
                      className="h-12"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
                      placeholder="+234..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="supplierTaxId"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax ID</FormLabel>
                  <FormControl>
                    <Input
                      className="h-12"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
                      placeholder="TIN/VAT-ID"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField
              name="bankDetails.bankName"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank name</FormLabel>
                  <FormControl>
                    <Input
                      className="h-12"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              name="bankDetails.accountName"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account name</FormLabel>
                  <FormControl>
                    <Input
                      className="h-12"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              name="bankDetails.accountNumber"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account number</FormLabel>
                  <FormControl>
                    <Input
                      className="h-12"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <FormField
            name="footerNote"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Footer note</FormLabel>
                <FormControl>
                  <Textarea
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value || null)}
                    placeholder="Thank you for your business."
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {submitError && <p className="text-sm text-red-600">{submitError}</p>}

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </Card>
      </form>
    </Form>
  );
}
