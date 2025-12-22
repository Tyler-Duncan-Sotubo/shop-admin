// src/features/company-settings/payments/hooks/use-payment-settings.ts
"use client";

import { useState } from "react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  fetchPaymentSettings,
  updatePaymentSetting,
} from "../api/payment-settings.api";
import { PaymentSettings } from "../types/payment-settings.type";
import { useDebounceCallback } from "@/shared/hooks/use-debounce";

export function usePaymentSettings() {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();

  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [savedSettings, setSavedSettings] = useState<PaymentSettings | null>(
    null
  );

  const { isLoading, isError } = useQuery({
    queryKey: ["payment-settings"],
    enabled: !!session?.backendTokens?.accessToken,
    queryFn: async () => {
      const data = await fetchPaymentSettings(axiosInstance);

      const normalized: PaymentSettings = {
        enabledProviders: data.enabledProviders ?? [],
        defaultProvider: data.defaultProvider ?? "paystack",
        manualPaymentMethods: data.manualPaymentMethods ?? [],
        allowPartialPayments: data.allowPartialPayments ?? false,
      };

      setSettings(normalized);
      setSavedSettings(normalized);

      return normalized;
    },
  });

  const handleUpdate = async (key: keyof PaymentSettings, value: unknown) => {
    if (!settings || !savedSettings) return;

    // prevent unnecessary API calls
    if (JSON.stringify(value) === JSON.stringify(savedSettings[key])) return;

    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));

    try {
      await updatePaymentSetting(
        axiosInstance,
        key,
        value,
        session?.backendTokens?.accessToken
      );

      setSavedSettings((prev) => (prev ? { ...prev, [key]: value } : prev));

      toast("Payment settings updated successfully");
    } catch {
      toast("Failed to update payment settings");

      const fresh = await fetchPaymentSettings(axiosInstance);
      setSettings(fresh);
      setSavedSettings(fresh);
    }
  };

  const { debounced: debouncedUpdate } = useDebounceCallback(handleUpdate, 400);

  return {
    sessionStatus: status,
    settings,
    setSettings,
    debouncedUpdate,
    isLoading,
    isError,
  };
}
