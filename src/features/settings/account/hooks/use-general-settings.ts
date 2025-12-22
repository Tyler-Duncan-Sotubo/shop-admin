"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { useDebounceCallback } from "@/shared/hooks/use-debounce";
import {
  fetchGeneralSettings,
  updateGeneralSetting,
} from "../api/general-settings.api";
import { GeneralSettings } from "../types/general-settings.type";

export function useGeneralSettings() {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();

  const [settings, setSettings] = useState<GeneralSettings | null>(null);
  const [savedSettings, setSavedSettings] = useState<GeneralSettings | null>(
    null
  );

  const { isLoading, isError } = useQuery({
    queryKey: ["general-settings"],
    enabled: !!session?.backendTokens?.accessToken,
    queryFn: async () => {
      const data = await fetchGeneralSettings(axiosInstance);

      const normalized: GeneralSettings = {
        storefrontUrl: data.storefrontUrl ?? "",
        supportEmail: data.supportEmail ?? "",
        supportPhone: data.supportPhone ?? "",
      };

      setSettings(normalized);
      setSavedSettings(normalized);
      return normalized;
    },
  });

  const handleUpdate = async (key: keyof GeneralSettings, value: string) => {
    if (!settings || !savedSettings) return;

    // no API call if unchanged vs last saved
    if (value === savedSettings[key]) return;

    // optimistic update
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));

    try {
      await updateGeneralSetting(
        axiosInstance,
        key,
        value,
        session?.backendTokens?.accessToken
      );

      setSavedSettings((prev) => (prev ? { ...prev, [key]: value } : prev));

      toast("Setting updated successfully");
    } catch {
      toast("Failed to update setting");

      // reload from server on error
      const fresh = await fetchGeneralSettings(axiosInstance);
      const normalized: GeneralSettings = {
        storefrontUrl: fresh.storefrontUrl ?? "",
        supportEmail: fresh.supportEmail ?? "",
        supportPhone: fresh.supportPhone ?? "",
      };
      setSettings(normalized);
      setSavedSettings(normalized);
    }
  };

  const { debounced: debouncedUpdate } = useDebounceCallback(handleUpdate, 500);

  return {
    sessionStatus: status,
    settings,
    setSettings,
    isLoading,
    isError,
    debouncedUpdate,
  };
}
