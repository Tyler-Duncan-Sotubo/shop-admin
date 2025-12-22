// src/features/company-settings/payments/api/payment-settings.api.ts

import { AxiosInstance } from "axios";
import { PaymentSettings } from "../types/payment-settings.type";

type PaymentSettingsApi = {
  payments: {
    enabled_providers: string[];
    default_provider: string;
    manual_payment_methods: string[];
    allow_partial_payments: boolean;
  };
};

// --- MAP snake_case → camelCase ---
const mapFromApi = (raw: PaymentSettingsApi["payments"]): PaymentSettings => ({
  enabledProviders: raw.enabled_providers ?? [],
  defaultProvider: raw.default_provider ?? "",
  manualPaymentMethods: raw.manual_payment_methods ?? [],
  allowPartialPayments: raw.allow_partial_payments ?? false,
});

// --- MAP camelCase → snake_case (and add prefix) ---
const mapToApiKey = (key: keyof PaymentSettings) => {
  const keyMap: Record<keyof PaymentSettings, string> = {
    enabledProviders: "enabled_providers",
    defaultProvider: "default_provider",
    manualPaymentMethods: "manual_payment_methods",
    allowPartialPayments: "allow_partial_payments",
  };

  return `payments.${keyMap[key]}`;
};

export const fetchPaymentSettings = async (
  axios: AxiosInstance
): Promise<PaymentSettings> => {
  const res = await axios.get("/api/company-settings/payments");

  const raw = res.data?.data;

  return mapFromApi(raw);
};

export const updatePaymentSetting = async (
  axios: AxiosInstance,
  key: keyof PaymentSettings,
  value: unknown,
  accessToken?: string
) => {
  const prefixedKey = mapToApiKey(key);

  await axios.patch(
    "/api/company-settings",
    {
      key: prefixedKey,
      value,
    },
    accessToken
      ? {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      : undefined
  );
};
