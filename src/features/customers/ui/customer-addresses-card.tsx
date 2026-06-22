/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";
import { Checkbox } from "@/shared/ui/checkbox";
import { FormSheet } from "@/shared/ui/form-sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import {
  CreateAddressPayload,
  CustomerAddress,
  CustomerDetail,
} from "../types/admin-customer.type";
import {
  CustomerAddressFormValues,
  customerAddressSchema,
} from "../schema/customer.schema";
import { useCreateMutation } from "@/shared/hooks/use-create-mutation";
import { H4 } from "@/shared/ui/typography";
import { FaEdit } from "react-icons/fa";
import { useUpdateMutation } from "@/shared/hooks/use-update-mutation";
import { NG_REGION_CODES } from "@/shared/constants/ng-regions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

export type UpdateAddressPayload = Partial<CreateAddressPayload>;

type Props = {
  customer: CustomerDetail;
};

function asText(v: string | null | undefined) {
  return v?.trim() ? v : "";
}

export function CustomerAddressesCard({ customer }: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [serverError, setServerError] = useState("");

  const addresses = customer.addresses || [];

  const form = useForm<CustomerAddressFormValues>({
    resolver: zodResolver(customerAddressSchema),
    defaultValues: {
      label: "", addressee: "", companyName: "",
      firstName: "", lastName: "",
      line1: "", line2: "",
      city: "", state: "", postalCode: "", country: "",
      phone: "", isDefaultBilling: false, isDefaultShipping: false,
    },
  });

  const openCreate = () => {
    setMode("create");
    setEditingId(null);
    setServerError("");
    form.reset({
      label: "", firstName: "", lastName: "",
      addressee: "", companyName: "",
      line1: "", line2: "",
      city: "", state: "", postalCode: "", country: "",
      phone: "", isDefaultBilling: false, isDefaultShipping: false,
    });
    setSheetOpen(true);
  };

  const openEdit = (addr: CustomerAddress) => {
    setMode("edit");
    setEditingId(addr.id);
    setServerError("");
    form.reset({
      label: asText(addr.label),
      firstName: asText(addr.firstName),
      lastName: asText(addr.lastName),
      addressee: asText(addr.addressee),
      companyName: asText(addr.companyName),
      line1: asText(addr.line1),
      line2: asText(addr.line2),
      city: asText(addr.city),
      state: asText(addr.state),
      postalCode: asText(addr.postalCode),
      country: asText(addr.country),
      phone: asText(addr.phone),
      isDefaultBilling: !!addr.isDefaultBilling,
      isDefaultShipping: !!addr.isDefaultShipping,
    });
    setSheetOpen(true);
  };

  const createAddress = useCreateMutation({
    endpoint: `/api/admin/customers/${customer.id}/addresses`,
    successMessage: "Address created successfully.",
    refetchKey: "admin customers detail",
  });

  const updateAddress = useUpdateMutation({
    endpoint: editingId
      ? `/api/admin/customers/${customer.id}/addresses/${editingId}`
      : "",
    successMessage: "Address updated successfully.",
    refetchKey: "admin customers detail",
  });

  const submit = async (values: CustomerAddressFormValues) => {
    setServerError("");
    const payload: CreateAddressPayload = {
      label: values.label?.trim() || undefined,
      addressee: values.addressee?.trim() || undefined,
      companyName: values.companyName?.trim() || undefined,
      firstName: values.firstName?.trim() || undefined,
      lastName: values.lastName?.trim() || undefined,
      line1: values.line1.trim(),
      line2: values.line2?.trim() || undefined,
      city: values.city?.trim() || undefined,
      state: values.state?.trim() || undefined,
      postalCode: values.postalCode?.trim() || undefined,
      country: values.country?.trim() || undefined,
      phone: values.phone?.trim() || undefined,
      isDefaultBilling: !!values.isDefaultBilling,
      isDefaultShipping: !!values.isDefaultShipping,
    };
    if (mode === "create") {
      await createAddress(payload, setServerError, undefined, () => setSheetOpen(false));
    } else if (editingId) {
      await updateAddress(payload, setServerError, () => setSheetOpen(false));
    }
  };

  return (
    <>
      <div className="max-w-3xl">
        <section className="flex flex-row items-start justify-between gap-4 mt-10">
          <div>
            <H4 className="text-lg">Addresses</H4>
            <div className="mt-1 text-sm text-muted-foreground">
              Billing and shipping addresses for this customer.
            </div>
          </div>
          <Button onClick={openCreate}>Add address</Button>
        </section>

        <div className="space-y-3 mt-10">
          {addresses.length === 0 ? (
            <div className="text-sm text-muted-foreground">No addresses yet.</div>
          ) : (
            addresses.map((a) => (
              <Card key={a.id} className="border-muted/60">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold">{a.label || "Address"}</span>
                      {a.isDefaultShipping && (
                        <Badge className="h-5 text-[11px]">Default shipping</Badge>
                      )}
                      {a.isDefaultBilling && (
                        <Badge variant="secondary" className="h-5 text-[11px]">Default billing</Badge>
                      )}
                    </div>
                    <Button variant="link" size="sm" onClick={() => openEdit(a)}>
                      <FaEdit />
                    </Button>
                  </div>

                  <div className="text-sm">
                    {(a.addressee || a.firstName || a.lastName) && (
                      <div className="flex items-start gap-3 px-3 py-2">
                        <span className="w-28 shrink-0 text-muted-foreground">Addressee</span>
                        <span className="font-medium">
                          {a.addressee ?? [a.firstName, a.lastName].filter(Boolean).join(" ")}
                        </span>
                      </div>
                    )}
                    {a.companyName && (
                      <div className="flex items-start gap-3 px-3 py-2">
                        <span className="w-28 shrink-0 text-muted-foreground">Company</span>
                        <span className="font-medium">{a.companyName}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-3 px-3 py-2">
                      <span className="w-28 shrink-0 text-muted-foreground">Address</span>
                      <span className="font-medium">
                        {[a.line1, a.line2].filter(Boolean).join(", ")}
                      </span>
                    </div>
                    {(a.city || a.state || a.postalCode) && (
                      <div className="flex items-start gap-3 px-3 py-2">
                        <span className="w-28 shrink-0 text-muted-foreground">City / State</span>
                        <span className="font-medium">
                          {[a.city, a.state?.replace(/_/g, " "), a.postalCode].filter(Boolean).join(", ")}
                        </span>
                      </div>
                    )}
                    {a.country && (
                      <div className="flex items-start gap-3 px-3 py-2">
                        <span className="w-28 shrink-0 text-muted-foreground">Country</span>
                        <span className="font-medium">{a.country}</span>
                      </div>
                    )}
                    {a.phone && (
                      <div className="flex items-start gap-3 px-3 py-2">
                        <span className="w-28 shrink-0 text-muted-foreground">Phone</span>
                        <span className="font-medium">{a.phone}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <FormSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        mode={mode}
        title={mode === "create" ? "Add address" : "Edit address"}
        onSubmit={(e) => {
          e.preventDefault();
          void form.handleSubmit(submit)();
        }}
        submitLabel={mode === "create" ? "Add address" : "Save changes"}
        isSubmitting={false}
      >
        {serverError && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm">
            {serverError}
          </div>
        )}

        <Form {...form}>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField control={form.control} name="label" render={({ field }) => (
                <FormItem>
                  <FormLabel>Label</FormLabel>
                  <FormControl><Input placeholder="e.g. Home, Office" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl><Input placeholder="+234..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField control={form.control} name="addressee" render={({ field }) => (
                <FormItem>
                  <FormLabel>Addressee</FormLabel>
                  <FormControl><Input placeholder="e.g. Procurement Manager" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="companyName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Company name</FormLabel>
                  <FormControl><Input placeholder="e.g. Acme Corporation" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField control={form.control} name="firstName" render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl><Input placeholder="Jane" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="lastName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name</FormLabel>
                  <FormControl><Input placeholder="Doe" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="line1" render={({ field }) => (
              <FormItem>
                <FormLabel>Address line 1 *</FormLabel>
                <FormControl><Input placeholder="123 Street" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="line2" render={({ field }) => (
              <FormItem>
                <FormLabel>Address line 2</FormLabel>
                <FormControl><Input placeholder="Apt, suite, etc." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField control={form.control} name="city" render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="state" render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <Select value={field.value || ""} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {NG_REGION_CODES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField control={form.control} name="postalCode" render={({ field }) => (
                <FormItem>
                  <FormLabel>Postal code</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="country" render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="flex items-center gap-6 pt-2">
              <FormField control={form.control} name="isDefaultShipping" render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox checked={!!field.value} onCheckedChange={(v) => field.onChange(!!v)} />
                  </FormControl>
                  <FormLabel className="text-sm font-normal">Default shipping</FormLabel>
                </FormItem>
              )} />
              <FormField control={form.control} name="isDefaultBilling" render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox checked={!!field.value} onCheckedChange={(v) => field.onChange(!!v)} />
                  </FormControl>
                  <FormLabel className="text-sm font-normal">Default billing</FormLabel>
                </FormItem>
              )} />
            </div>
          </div>
        </Form>
      </FormSheet>
    </>
  );
}
