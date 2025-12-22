import { AxiosInstance } from "axios";
import { SecuritySettings } from "../types/security-settings.type";

type SecuritySettingsApi = {
  security: {
    two_factor_auth_required_for_admins: boolean;
    two_factor_auth_optional_for_staff: boolean;

    session_timeout_minutes: number;

    allowed_ip_ranges: string[];

    rate_limit: {
      enabled: boolean;
      window_seconds: number;
      max_requests: number;
    };
  };
};

// snake_case → camelCase (UI friendly)
const mapFromApi = (
  raw: SecuritySettingsApi["security"]
): SecuritySettings => ({
  twoFactorAuthRequiredForAdmins:
    raw?.two_factor_auth_required_for_admins ?? false,
  twoFactorAuthOptionalForStaff:
    raw?.two_factor_auth_optional_for_staff ?? true,

  sessionTimeoutMinutes: raw?.session_timeout_minutes ?? 60 * 8,

  allowedIpRanges: raw?.allowed_ip_ranges ?? [],

  rateLimitEnabled: raw?.rate_limit?.enabled ?? true,
  rateLimitWindowSeconds: raw?.rate_limit?.window_seconds ?? 60,
  rateLimitMaxRequests: raw?.rate_limit?.max_requests ?? 120,
});

// camelCase key → prefixed snake_case key for PATCH
const mapToApiKey = (key: keyof SecuritySettings) => {
  const keyMap: Record<keyof SecuritySettings, string> = {
    twoFactorAuthRequiredForAdmins: "two_factor_auth_required_for_admins",
    twoFactorAuthOptionalForStaff: "two_factor_auth_optional_for_staff",

    sessionTimeoutMinutes: "session_timeout_minutes",
    allowedIpRanges: "allowed_ip_ranges",

    rateLimitEnabled: "rate_limit.enabled",
    rateLimitWindowSeconds: "rate_limit.window_seconds",
    rateLimitMaxRequests: "rate_limit.max_requests",
  };

  return `security.${keyMap[key]}`;
};

export const fetchSecuritySettings = async (
  axios: AxiosInstance
): Promise<SecuritySettings> => {
  const res = await axios.get("/api/company-settings/security");

  // supports multiple response shapes:
  // { data: { security: {...} } } OR { data: {...} } OR { security: {...} }
  const raw =
    res.data?.data?.security ??
    res.data?.data ??
    res.data?.security ??
    res.data;

  return mapFromApi(raw);
};

export const updateSecuritySetting = async (
  axios: AxiosInstance,
  key: keyof SecuritySettings,
  value: unknown,
  accessToken?: string
) => {
  const prefixedKey = mapToApiKey(key);

  await axios.patch(
    "/api/company-settings",
    { key: prefixedKey, value },
    accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : undefined
  );
};
