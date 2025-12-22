// src/modules/customers/admin/ui/create-customer-modal.tsx
"use client";

import { FormEvent, useMemo, useState } from "react";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormModal } from "@/shared/ui/form-modal";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form"; // adjust to your shadcn path
import { Checkbox } from "@/shared/ui/checkbox"; // adjust to your shadcn path
import { useCreateCustomer } from "../hooks/use-create-customer";
import type { CreateCustomerPayload } from "../hooks/use-create-customer";

type Props = {
  open: boolean;
  onClose: () => void;
};

const schema = z.object({
  email: z.email("Please enter a valid email."),
  firstName: z.string().trim().optional().or(z.literal("")),
  lastName: z.string().trim().optional().or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
  marketingOptIn: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

export function CreateCustomerModal({ open, onClose }: Props) {
  const [serverError, setServerError] = useState("");
  const { createCustomer } = useCreateCustomer();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
      marketingOptIn: false,
    },
    mode: "onSubmit",
  });

  const resetForm = () => {
    form.reset({
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
      marketingOptIn: false,
    });
    setServerError("");
  };

  const handleSubmit = async (values: FormValues) => {
    setServerError("");

    const payload: CreateCustomerPayload = {
      email: values.email.trim().toLowerCase(),
      firstName: values.firstName?.trim() ? values.firstName.trim() : undefined,
      lastName: values.lastName?.trim() ? values.lastName.trim() : undefined,
      phone: values.phone?.trim() ? values.phone.trim() : undefined,
      marketingOptIn: !!values.marketingOptIn,
    };

    // useCreateMutation expects setError/resetForm/onClose
    await createCustomer(payload, setServerError, resetForm, onClose);
  };

  // If you want to disable submit until email is valid:
  const emailValue = useWatch({ control: form.control, name: "email" });
  const canSubmit = useMemo(() => {
    const e = (emailValue ?? "").trim();
    return e.length > 3 && e.includes("@");
  }, [emailValue]);

  return (
    <FormModal
      open={open}
      onClose={() => {
        resetForm();
        onClose();
      }}
      mode="create"
      title="Create customer"
      description="Add a customer to this company."
      onSubmit={(e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        void form.handleSubmit(handleSubmit)();
      }}
      submitLabel="Create customer"
      // If you upgrade your mutation hook to expose loading, pass it here.
      isSubmitting={false}
    >
      <Form {...form}>
        <div className="space-y-4">
          {serverError ? (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm">
              {serverError}
            </div>
          ) : null}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input placeholder="customer@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input placeholder="Jane" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="+44..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="marketingOptIn"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={!!field.value}
                    onCheckedChange={(v) => field.onChange(!!v)}
                  />
                </FormControl>
                <FormLabel className="text-sm font-normal">
                  Marketing opt-in
                </FormLabel>
              </FormItem>
            )}
          />

          <div className="pt-2">
            <Button type="button" variant="clean" onClick={resetForm}>
              Reset
            </Button>
          </div>

          {!canSubmit ? (
            <div className="text-xs text-muted-foreground">
              Enter a valid email to enable submit.
            </div>
          ) : null}
        </div>
      </Form>
    </FormModal>
  );
}
