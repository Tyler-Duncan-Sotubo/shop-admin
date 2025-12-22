"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { useDebounceCallback } from "@/shared/hooks/use-debounce";
import { fetchTaxSettings, updateTaxSetting } from "../api/tax-settings.api";

import { TaxSettings } from "../types/tax-settings.type";

export function useTaxSettings() {
  const { data: session, status } = useSession();
  const axios = useAxiosAuth();

  const [settings, setSettings] = useState<TaxSettings | null>(null);
  const [savedSettings, setSavedSettings] = useState<TaxSettings | null>(null);

  const { isLoading, isError } = useQuery({
    queryKey: ["tax-settings"],
    enabled: !!session?.backendTokens?.accessToken,
    queryFn: async () => {
      const data = await fetchTaxSettings(axios);

      const normalized: TaxSettings = {
        pricesIncludeTax: data.pricesIncludeTax,
        chargeTax: data.chargeTax,
        defaultCountry: data.defaultCountry,
        defaultState: data.defaultState,
        roundingStrategy: data.roundingStrategy,
        enableVat: data.enableVat,
        vatDefaultRate: data.vatDefaultRate,
      };

      setSettings(normalized);
      setSavedSettings(normalized);

      return normalized;
    },
  });

  const handleUpdate = async (
    key: keyof TaxSettings,
    value: string | number | boolean
  ) => {
    if (!settings || !savedSettings) return;

    if (value === savedSettings[key]) return;

    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));

    try {
      await updateTaxSetting(
        axios,
        key,
        value,
        session?.backendTokens?.accessToken
      );

      setSavedSettings((prev) => (prev ? { ...prev, [key]: value } : prev));

      toast("Tax setting updated");
    } catch {
      toast("Failed to update tax setting");
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
