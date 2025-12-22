"use client";

import { FormEvent, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Switch } from "@/shared/ui/switch";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { FormModal } from "@/shared/ui/form-modal"; // FormModal import
import { CustomerDetail } from "../types/admin-customer.type";
import { useUpdateMutation } from "@/shared/hooks/use-update-mutation";
import {
  CustomerDetailsFormValues,
  customerDetailsSchema,
} from "../schema/customer.schema";
import { FaEdit } from "react-icons/fa";

type Props = {
  customer: CustomerDetail;
};

function fmt(d?: string | Date | null) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

export function CustomerDetailsCard({ customer }: Props) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState("");

  const editCustomerDetails = useUpdateMutation({
    endpoint: `/api/admin/customers/${customer.id}`,
    successMessage: "Customer updated successfully.",
    refetchKey: "admin customers",
  });

  const form = useForm<CustomerDetailsFormValues>({
    resolver: zodResolver(customerDetailsSchema),
    defaultValues: {
      firstName: customer.firstName ?? "",
      lastName: customer.lastName ?? "",
      phone: customer.phone ?? "",
      marketingOptIn: !!customer.marketingOptIn,
      isActive: customer.isActive ?? true,
    },
  });

  // keep defaults in sync when customer changes
  useEffect(() => {
    form.reset({
      firstName: customer.firstName ?? "",
      lastName: customer.lastName ?? "",
      phone: customer.phone ?? "",
      marketingOptIn: !!customer.marketingOptIn,
      isActive: customer.isActive ?? true,
    });
  }, [
    customer.id,
    customer.firstName,
    customer.lastName,
    customer.phone,
    customer.marketingOptIn,
    customer.isActive,
    form,
  ]);
  const submit = async (values: CustomerDetailsFormValues) => {
    await editCustomerDetails(values, setServerError, () => setOpen(false));
    setServerError("");
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg">
              {customer.firstName || customer.lastName
                ? `${customer.firstName ?? ""} ${
                    customer.lastName ?? ""
                  }`.trim()
                : customer.email}
            </CardTitle>
            <div className="mt-1 text-sm text-muted-foreground">
              {customer.email}
            </div>
          </div>

          <Button onClick={() => setOpen(true)} variant={"link"}>
            {" "}
            <FaEdit />
          </Button>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Phone</div>
            <div className="text-sm">{customer.phone ?? "—"}</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Marketing</div>
            <div className="text-sm">
              {customer.marketingOptIn ? "Opted in" : "No"}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Created</div>
            <div className="text-sm">{fmt(customer.createdAt)}</div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Last login</div>
            <div className="text-sm">{fmt(customer.lastLogin)}</div>
          </div>

          <div className="flex items-center gap-2 md:col-span-2">
            <Switch checked={!!customer.isActive} disabled />
            <Label className="text-sm">Active</Label>
          </div>
        </CardContent>
      </Card>

      {/* Replace Sheet with FormModal */}
      <FormModal
        open={open}
        onClose={() => setOpen(false)}
        mode="edit"
        title="Edit Customer"
        description="Update customer details"
        onSubmit={(e: FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          void form.handleSubmit(submit)();
        }}
        submitLabel="Save"
        isSubmitting={false} // Update this with your actual loading state if necessary
      >
        {serverError ? (
          <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm">
            {serverError}
          </div>
        ) : null}

        <Form {...form}>
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
              <FormItem className="flex items-center gap-2 space-y-0">
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

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={!!field.value}
                    onCheckedChange={(v) => field.onChange(!!v)}
                  />
                </FormControl>
                <FormLabel className="text-sm font-normal">Active</FormLabel>
              </FormItem>
            )}
          />
        </Form>
      </FormModal>
    </>
  );
}
