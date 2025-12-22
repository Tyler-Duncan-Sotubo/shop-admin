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
import { FormModal } from "@/shared/ui/form-modal";
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
      label: "",
      firstName: "",
      lastName: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      phone: "",
      isDefaultBilling: false,
      isDefaultShipping: false,
    },
  });

  const openCreate = () => {
    setMode("create");
    setEditingId(null);
    setServerError("");
    form.reset({
      label: "",
      firstName: "",
      lastName: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      phone: "",
      isDefaultBilling: false,
      isDefaultShipping: false,
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
      label: values.label?.trim() ? values.label.trim() : undefined,
      firstName: values.firstName?.trim() ? values.firstName.trim() : undefined,
      lastName: values.lastName?.trim() ? values.lastName.trim() : undefined,
      line1: values.line1.trim(),
      line2: values.line2?.trim() ? values.line2.trim() : undefined,
      city: values.city?.trim() ? values.city.trim() : undefined,
      state: values.state?.trim() ? values.state.trim() : undefined,
      postalCode: values.postalCode?.trim()
        ? values.postalCode.trim()
        : undefined,
      country: values.country?.trim() ? values.country.trim() : undefined,
      phone: values.phone?.trim() ? values.phone.trim() : undefined,
      isDefaultBilling: !!values.isDefaultBilling,
      isDefaultShipping: !!values.isDefaultShipping,
    };

    try {
      if (mode === "create") {
        await createAddress(payload, setServerError, () => setSheetOpen(false));
      } else if (editingId) {
        await updateAddress(payload, setServerError, () => setSheetOpen(false));
      }
      setSheetOpen(false);
    } catch (e: any) {
      setServerError(e?.message ?? "Failed to save address");
    }
  };

  return (
    <>
      <div className="max-w-3xl ">
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
            <div className="text-sm text-muted-foreground">
              No addresses yet.
            </div>
          ) : (
            addresses.map((a) => (
              <Card key={a.id} className="border-muted/60">
                <CardContent className="p-4">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="truncate text-sm font-semibold">
                          {a.label || "Address"}
                        </div>

                        {a.isDefaultShipping ? (
                          <Badge className="h-6">Default shipping</Badge>
                        ) : null}

                        {a.isDefaultBilling ? (
                          <Badge variant="secondary" className="h-6">
                            Default billing
                          </Badge>
                        ) : null}
                      </div>
                    </div>

                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => openEdit(a)}
                    >
                      <FaEdit />
                    </Button>
                  </div>

                  {/* Person line */}
                  <div className="mt-2 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {[a.firstName, a.lastName].filter(Boolean).join(" ") ||
                        "—"}
                    </span>
                    {a.phone ? (
                      <span className="text-muted-foreground">
                        {" "}
                        • {a.phone}
                      </span>
                    ) : null}
                  </div>

                  {/* Address line */}
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="text-foreground">
                      {a.line1 ?? ""}
                      {a.line2 ? (
                        <span className="text-muted-foreground">
                          , {a.line2}
                        </span>
                      ) : null}
                    </div>

                    <div className="text-muted-foreground">
                      {[a.city, a.state, a.postalCode]
                        .filter(Boolean)
                        .join(", ") || "—"}
                      {a.country ? <span> • {a.country}</span> : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <FormModal
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        mode={mode === "create" ? "create" : "edit"}
        title={mode === "create" ? "Add address" : "Edit address"}
        description=""
        onSubmit={(e) => {
          e.preventDefault();
          void form.handleSubmit(submit)();
        }}
        submitLabel={mode === "create" ? "Add address" : "Save changes"}
        isSubmitting={false}
      >
        {serverError ? (
          <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm">
            {serverError}
          </div>
        ) : null}

        <div className="mt-4">
          <Form {...form}>
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="label"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Label</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Home, Office" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
              </div>

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
                name="line1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address line 1 *</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Street" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="line2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address line 2</FormLabel>
                    <FormControl>
                      <Input placeholder="Apt, suite, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="h-14 px-3 w-full">
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
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal code</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
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
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <FormField
                  control={form.control}
                  name="isDefaultShipping"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={!!field.value}
                          onCheckedChange={(v) => field.onChange(!!v)}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        Default shipping
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isDefaultBilling"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={!!field.value}
                          onCheckedChange={(v) => field.onChange(!!v)}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        Default billing
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </Form>
        </div>
      </FormModal>
    </>
  );
}
