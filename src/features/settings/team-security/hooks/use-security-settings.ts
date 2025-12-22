"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { useDebounceCallback } from "@/shared/hooks/use-debounce";

import {
  fetchSecuritySettings,
  updateSecuritySetting,
} from "../api/security-settings.api";
import { SecuritySettings } from "../types/security-settings.type";

export function useSecuritySettings() {
  const { data: session, status } = useSession();
  const axiosInstance = useAxiosAuth();

  const [settings, setSettings] = useState<SecuritySettings | null>(null);
  const [savedSettings, setSavedSettings] = useState<SecuritySettings | null>(
    null
  );

  const { isLoading, isError } = useQuery({
    queryKey: ["security-settings"],
    enabled: !!session?.backendTokens?.accessToken,
    queryFn: async () => {
      const data = await fetchSecuritySettings(axiosInstance);

      // normalize + defaults (safety)
      const normalized: SecuritySettings = {
        twoFactorAuthRequiredForAdmins:
          data.twoFactorAuthRequiredForAdmins ?? false,
        twoFactorAuthOptionalForStaff:
          data.twoFactorAuthOptionalForStaff ?? true,

        sessionTimeoutMinutes: data.sessionTimeoutMinutes ?? 60 * 8,
        allowedIpRanges: data.allowedIpRanges ?? [],

        rateLimitEnabled: data.rateLimitEnabled ?? true,
        rateLimitWindowSeconds: data.rateLimitWindowSeconds ?? 60,
        rateLimitMaxRequests: data.rateLimitMaxRequests ?? 120,
      };

      setSettings(normalized);
      setSavedSettings(normalized);

      return normalized;
    },
  });

  const handleUpdate = async (key: keyof SecuritySettings, value: unknown) => {
    if (!settings || !savedSettings) return;

    if (JSON.stringify(value) === JSON.stringify(savedSettings[key])) return;

    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));

    try {
      await updateSecuritySetting(
        axiosInstance,
        key,
        value,
        session?.backendTokens?.accessToken
      );

      setSavedSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
      toast("Security settings updated successfully");
    } catch {
      toast("Failed to update security settings");

      const fresh = await fetchSecuritySettings(axiosInstance);
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
