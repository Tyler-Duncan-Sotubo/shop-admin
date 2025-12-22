// src/modules/customers/admin/hooks/use-create-customer.ts
"use client";

import { useCreateMutation } from "@/shared/hooks/use-create-mutation"; // adjust path
// or wherever your useCreateMutation lives

export type CreateCustomerPayload = {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  marketingOptIn?: boolean;
};

export type CreatedCustomerResponse = {
  customer: {
    id: string;
    companyId: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
};

export function useCreateCustomer() {
  const endpoint = `/api/admin/customers/register`;

  const create = useCreateMutation<CreateCustomerPayload>({
    endpoint,
    successMessage: "Customer created",
    refetchKey: "admin customers",
  });

  return { createCustomer: create };
}
