export interface SecuritySettings {
  // 2FA policies
  twoFactorAuthRequiredForAdmins: boolean;
  twoFactorAuthOptionalForStaff: boolean;

  // session timeout (minutes)
  sessionTimeoutMinutes: number;

  // IP allow list (CIDR strings)
  allowedIpRanges: string[];

  // rate limiting
  rateLimitEnabled: boolean;
  rateLimitWindowSeconds: number;
  rateLimitMaxRequests: number;
}

export type SecuritySettingsApi = {
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
