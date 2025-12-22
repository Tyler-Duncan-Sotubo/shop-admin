/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormModal } from "@/shared/ui/form-modal";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

import { useCreateMutation } from "@/shared/hooks/use-create-mutation";
import { CreateCartValues, Schema } from "../schema";
import { CustomerCombobox } from "./customer-combo-box";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import type { AdminCustomersQuery } from "@/features/customers/hooks/use-admin-customers";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import { useGetStoreLocations } from "@/features/inventory/core/hooks/use-inventory";
import { Checkbox } from "@/shared/ui/checkbox";

function toQueryString(q?: AdminCustomersQuery) {
  const sp = new URLSearchParams();
  if (!q) return "";

  if (q.search) sp.set("search", q.search);
  if (typeof q.includeInactive === "boolean")
    sp.set("includeInactive", String(q.includeInactive));

  sp.set("limit", String(q.limit ?? 50));
  sp.set("offset", String(q.offset ?? 0));

  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

export function CreateCartModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const axios = useAxiosAuth();

  const { activeStoreId } = useStoreScope();

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [attachCustomer, setAttachCustomer] = useState(false);

  // ✅ POS toggle + origin
  const [isPos, setIsPos] = useState(false);

  // ✅ define a query (even if it's static for now)
  const query = useMemo<AdminCustomersQuery>(
    () => ({ search: "", limit: 50, offset: 0, includeInactive: false }),
    []
  );

  const form = useForm<
    CreateCartValues & { originInventoryLocationId?: string | null }
  >({
    resolver: zodResolver(Schema),
    defaultValues: {
      customerId: null,
      guestToken: null,
      currency: "NGN",
      originInventoryLocationId: null,
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (!open) return;

    form.reset(
      {
        customerId: null,
        guestToken: null,
        currency: "NGN",
        originInventoryLocationId: null,
      },
      { keepErrors: false }
    );
  }, [open, form]);

  const createCart = useCreateMutation({
    endpoint: "/api/carts",
    successMessage: "Cart created successfully.",
    refetchKey: "carts",
  });

  const accessToken = session?.backendTokens?.accessToken;

  const { data: customersRes = [] } = useQuery({
    queryKey: ["admin customers", query],
    enabled: !!open && !!accessToken,
    queryFn: async () => {
      const res = await axios.get(
        `/api/admin/customers${toQueryString(query)}`
      );
      return res.data.data as any[];
    },
  });

  const customerOptions = customersRes.map((c: any) => ({
    id: c.id,
    label: [c.firstName, c.lastName].filter(Boolean).join(" ") || c.email,
  }));

  // ✅ fetch store locations for POS origin select
  const { data: locations = [], isLoading: locationsLoading } =
    useGetStoreLocations(activeStoreId, session as any, axios);

  console.log("Store locations:", locations);

  const onSubmit = async (
    values: CreateCartValues & { originInventoryLocationId?: string | null }
  ) => {
    try {
      console.log("Submitting cart with values:", values);
      // POS validation: if POS is toggled, require origin
      if (isPos && !values.originInventoryLocationId) {
        setSubmitError("Please select a store location for this POS cart.");
        return;
      }

      const payload: any = {
        customerId: attachCustomer ? values.customerId : undefined,
        guestToken: values.guestToken || undefined,
        currency: (values.currency || "NGN").toUpperCase(),
      };

      if (isPos) {
        payload.channel = "pos";
        payload.originInventoryLocationId = values.originInventoryLocationId;
      }

      const res = await createCart(payload, setSubmitError);

      const cartId =
        (res as any)?.data?.data?.id ??
        (res as any)?.data?.id ??
        (res as any)?.id;

      if (cartId) {
        onClose();
        router.push(`/orders/carts/${cartId}`);
        return;
      }

      setSubmitError("Cart created, but no cart ID was returned.");
    } catch (e: any) {
      setSubmitError(
        e?.response?.data?.message ?? "Failed to create cart. Please try again."
      );
    }
  };

  return (
    <FormModal
      open={open}
      title="Create Cart"
      submitLabel="Create cart"
      onClose={onClose}
      onSubmit={form.handleSubmit(onSubmit)}
      isSubmitting={form.formState.isSubmitting}
    >
      <Form {...form}>
        <div className="space-y-4">
          <FormField
            name="currency"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Currency</FormLabel>
                <FormControl>
                  <Input
                    placeholder="NGN"
                    {...field}
                    value={(field.value ?? "NGN").toUpperCase()}
                    onChange={(e) =>
                      field.onChange(e.target.value.toUpperCase())
                    }
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  Use ISO currency code (e.g. NGN).
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* POS toggle */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="isPos"
              checked={isPos}
              onCheckedChange={(checked) => {
                const isChecked = Boolean(checked);
                setIsPos(isChecked);

                // clear origin if turned off
                if (!isChecked) {
                  form.setValue("originInventoryLocationId", null, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }
              }}
            />
            <label
              htmlFor="isPos"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              POS / In-store cart
            </label>
          </div>

          {/* Origin select (only for POS) */}
          {isPos && (
            <FormField
              name="originInventoryLocationId"
              control={form.control}
              rules={{ required: "Please select a store location" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Store location</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value ?? ""}
                      onValueChange={(v) => field.onChange(v || null)}
                      disabled={locationsLoading || !activeStoreId}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={
                            locationsLoading
                              ? "Loading locations…"
                              : !activeStoreId
                              ? "No active store selected"
                              : "Select a location"
                          }
                        />
                      </SelectTrigger>

                      <SelectContent>
                        {locations.map((loc: any) => (
                          <SelectItem
                            key={loc.locationId}
                            value={String(loc.locationId)} // ✅ ensures we send the ID
                          >
                            {loc.label ?? loc.name ?? "Unnamed location"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>

                  <p className="text-xs text-muted-foreground">
                    This will be used as the origin inventory location for POS
                    stock checks.
                  </p>

                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Attach customer toggle */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="attachCustomer"
              checked={attachCustomer}
              onCheckedChange={(checked) => {
                const isChecked = Boolean(checked);
                setAttachCustomer(isChecked);

                if (!isChecked) {
                  form.setValue("customerId", null, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }
              }}
            />
            <label
              htmlFor="attachCustomer"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Attach customer to this cart
            </label>
          </div>

          {!attachCustomer && (
            <p className="text-xs text-muted-foreground">
              Cart will be created as a guest cart.
            </p>
          )}

          {attachCustomer && (
            <FormField
              name="customerId"
              control={form.control}
              rules={{ required: "Please select a customer" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Customer</FormLabel>
                  <FormControl>
                    <CustomerCombobox
                      value={field.value ?? null}
                      onChange={(v) => field.onChange(v)}
                      options={customerOptions}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {submitError && (
            <p className="text-sm text-destructive">{submitError}</p>
          )}
        </div>
      </Form>
    </FormModal>
  );
}
