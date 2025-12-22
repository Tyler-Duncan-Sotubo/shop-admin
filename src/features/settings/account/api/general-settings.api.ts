// src/features/company-settings/general/api/general-settings.api.ts

import { AxiosInstance } from "axios";
import { GeneralSettings } from "../types/general-settings.type";

export type GeneralSettingsResponse = GeneralSettings;

export const fetchGeneralSettings = async (
  axios: AxiosInstance
): Promise<GeneralSettingsResponse> => {
  const res = await axios.get("/api/company-settings/general");
  // assuming backend returns camelCase like expense settings
  return res.data.data as GeneralSettingsResponse;
};

export const updateGeneralSetting = async (
  axios: AxiosInstance,
  key: keyof GeneralSettings,
  value: string,
  accessToken?: string
) => {
  await axios.patch(
    "/api/company-settings",
    { key, value },
    accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined
  );
};
