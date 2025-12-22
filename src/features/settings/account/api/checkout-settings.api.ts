import { AxiosInstance } from "axios";
import { CheckoutSettings } from "../types/checkout-settings.type";

type CheckoutSettingsApi = {
  allow_guest_checkout: boolean;
  require_phone: boolean;
  enable_order_comments: boolean;
  auto_capture_payment: boolean;
  cart_ttl_minutes: number;
};

// --- snake_case → camelCase ---
const mapFromApi = (raw: CheckoutSettingsApi): CheckoutSettings => ({
  allowGuestCheckout: raw.allow_guest_checkout ?? false,
  requirePhone: raw.require_phone ?? false,
  enableOrderComments: raw.enable_order_comments ?? false,
  autoCapturePayment: raw.auto_capture_payment ?? false,
  cartTtlMinutes: raw.cart_ttl_minutes ?? 1440,
});

// --- camelCase → snake_case (with prefix) ---
const mapToApiKey = (key: keyof CheckoutSettings) => {
  const keyMap: Record<keyof CheckoutSettings, string> = {
    allowGuestCheckout: "allow_guest_checkout",
    requirePhone: "require_phone",
    enableOrderComments: "enable_order_comments",
    autoCapturePayment: "auto_capture_payment",
    cartTtlMinutes: "cart_ttl_minutes",
  };

  return `checkout.${keyMap[key]}`;
};

export const fetchCheckoutSettings = async (
  axios: AxiosInstance
): Promise<CheckoutSettings> => {
  const res = await axios.get("/api/company-settings/checkout");

  const raw = res.data?.data as CheckoutSettingsApi;

  return mapFromApi(raw);
};

export const updateCheckoutSetting = async (
  axios: AxiosInstance,
  key: keyof CheckoutSettings,
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
