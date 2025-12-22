"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { useDebounceCallback } from "@/shared/hooks/use-debounce";
import {
  fetchCheckoutSettings,
  updateCheckoutSetting,
} from "../api/checkout-settings.api";
import { CheckoutSettings } from "../types/checkout-settings.type";

export function useCheckoutSettings() {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();

  const [settings, setSettings] = useState<CheckoutSettings | null>(null);
  const [savedSettings, setSavedSettings] = useState<CheckoutSettings | null>(
    null
  );

  const { isLoading, isError } = useQuery({
    queryKey: ["checkout-settings"],
    enabled: !!session?.backendTokens?.accessToken,
    queryFn: async () => {
      const data = await fetchCheckoutSettings(axiosInstance);

      const normalized: CheckoutSettings = {
        allowGuestCheckout: data.allowGuestCheckout ?? false,
        requirePhone: data.requirePhone ?? false,
        enableOrderComments: data.enableOrderComments ?? true,
        autoCapturePayment: data.autoCapturePayment ?? true,
        cartTtlMinutes: data.cartTtlMinutes ?? 1440,
      };

      setSettings(normalized);
      setSavedSettings(normalized);
      return normalized;
    },
  });

  const handleUpdate = async (
    key: keyof CheckoutSettings,
    value: boolean | number
  ) => {
    if (!settings || !savedSettings) return;

    if (value === savedSettings[key]) return; // no-op

    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));

    try {
      await updateCheckoutSetting(
        axiosInstance,
        key,
        value,
        session?.backendTokens?.accessToken
      );
      setSavedSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
      toast("Setting updated");
    } catch {
      toast("Failed to update setting");
    }
  };

  const { debounced: debouncedUpdate } = useDebounceCallback(handleUpdate, 400);

  return {
    sessionStatus: status,
    settings,
    setSettings,
    isLoading,
    isError,
    debouncedUpdate,
  };
}
