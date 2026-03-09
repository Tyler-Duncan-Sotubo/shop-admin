// features/orders/hooks/use-update-order-customer-shipping.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosInstance, AxiosError } from "axios";
import type { Session } from "next-auth";

type ApiError = {
  status: "error";
  error?: { message?: string };
  message?: string;
};

function getErrorMessage(err: unknown) {
  const e = err as AxiosError<ApiError>;
  return (
    e.response?.data?.error?.message ??
    e.response?.data?.message ??
    e.message ??
    "Something went wrong"
  );
}

export type UpdateOrderCustomerShippingInput = {
  orderId: string;

  customerId?: string;

  createCustomer?: {
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  };

  // customer_addresses.id
  shippingAddressId?: string;

  // optional (fallback handled by backend)
  billingAddressId?: string | null;

  // shipping_rates.id
  shippingRateId?: string | null;
};

export function useUpdateOrderCustomerShipping(
  session: Session | null,
  axios: AxiosInstance,
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateOrderCustomerShippingInput) => {
      const { orderId, ...body } = payload;

      const res = await axios.patch(
        `/api/orders/${orderId}/customer-shipping`,
        body,
      );

      return res.data.data;
    },

    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["orders", vars.orderId] });
    },

    onError: (err) => {
      throw new Error(getErrorMessage(err));
    },
  });
}
