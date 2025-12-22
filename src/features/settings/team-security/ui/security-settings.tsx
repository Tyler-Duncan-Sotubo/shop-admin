"use client";

import Loading from "@/shared/ui/loading";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";

import { useSecuritySettings } from "../hooks/use-security-settings";

function clampNumber(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function SecuritySettingsSection() {
  const {
    sessionStatus,
    settings,
    setSettings,
    debouncedUpdate,
    isLoading,
    isError,
  } = useSecuritySettings();

  if (sessionStatus === "loading" || isLoading || !settings) return <Loading />;
  if (isError) return <p>Error loading security settings</p>;

  return (
    <div className="space-y-6 md:w-2/3">
      {/* 2FA */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Two-factor authentication</CardTitle>
          <CardDescription>
            Control who must use 2FA and whether staff can opt in.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <Label htmlFor="require-2fa-admins">Require 2FA for admins</Label>
              <p className="text-xs text-muted-foreground max-w-md">
                Enforce 2FA for higher-privilege roles (e.g. Owner and Manager).
              </p>
            </div>

            <Switch
              id="require-2fa-admins"
              checked={settings.twoFactorAuthRequiredForAdmins}
              onCheckedChange={(checked) => {
                setSettings((prev) =>
                  prev
                    ? { ...prev, twoFactorAuthRequiredForAdmins: !!checked }
                    : prev
                );
                debouncedUpdate("twoFactorAuthRequiredForAdmins", !!checked);
              }}
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <Label htmlFor="optional-2fa-staff">Allow 2FA for staff</Label>
              <p className="text-xs text-muted-foreground max-w-md">
                Let staff enable 2FA on their own accounts even if it’s not
                enforced.
              </p>
            </div>

            <Switch
              id="optional-2fa-staff"
              checked={settings.twoFactorAuthOptionalForStaff}
              onCheckedChange={(checked) => {
                setSettings((prev) =>
                  prev
                    ? { ...prev, twoFactorAuthOptionalForStaff: !!checked }
                    : prev
                );
                debouncedUpdate("twoFactorAuthOptionalForStaff", !!checked);
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Session timeout */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Session</CardTitle>
          <CardDescription>
            Control how long users stay signed in before re-authentication is
            required.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="session-timeout">Session timeout (minutes)</Label>
            <Input
              id="session-timeout"
              type="number"
              min={5}
              max={60 * 24 * 7}
              value={settings.sessionTimeoutMinutes}
              onChange={(e) => {
                const n = clampNumber(
                  Number(e.target.value || 0),
                  5,
                  60 * 24 * 7
                );
                setSettings((prev) =>
                  prev ? { ...prev, sessionTimeoutMinutes: n } : prev
                );
              }}
              onBlur={() =>
                debouncedUpdate(
                  "sessionTimeoutMinutes",
                  settings.sessionTimeoutMinutes
                )
              }
            />
            <p className="text-xs text-muted-foreground">
              Example: 480 = 8 hours. Min 5 minutes. Max 7 days.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* IP allow list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">IP allow list</CardTitle>
          <CardDescription>
            Optionally restrict dashboard access to trusted IP ranges (CIDR).
            Leave empty to allow all.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="allowed-ips">Allowed IP ranges</Label>
            <Textarea
              id="allowed-ips"
              placeholder={`One per line, e.g.\n10.0.0.0/8\n192.168.1.0/24`}
              value={(settings.allowedIpRanges ?? []).join("\n")}
              onChange={(e) => {
                const list = e.target.value
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean);

                setSettings((prev) =>
                  prev ? { ...prev, allowedIpRanges: list } : prev
                );
              }}
              onBlur={() =>
                debouncedUpdate("allowedIpRanges", settings.allowedIpRanges)
              }
            />
            <p className="text-xs text-muted-foreground">
              Use CIDR notation. Changes may affect who can log in.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Rate limiting */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Rate limiting</CardTitle>
          <CardDescription>
            Basic protection against abuse. Enforcement typically happens in
            middleware.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <Label htmlFor="rate-limit-enabled">Enable rate limiting</Label>
              <p className="text-xs text-muted-foreground max-w-md">
                Applies global request limits per window.
              </p>
            </div>
            <Switch
              id="rate-limit-enabled"
              checked={settings.rateLimitEnabled}
              onCheckedChange={(checked) => {
                setSettings((prev) =>
                  prev ? { ...prev, rateLimitEnabled: !!checked } : prev
                );
                debouncedUpdate("rateLimitEnabled", !!checked);
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="rate-window">Window (seconds)</Label>
              <Input
                id="rate-window"
                type="number"
                min={10}
                max={60 * 60}
                value={settings.rateLimitWindowSeconds}
                disabled={!settings.rateLimitEnabled}
                onChange={(e) => {
                  const n = clampNumber(
                    Number(e.target.value || 0),
                    10,
                    60 * 60
                  );
                  setSettings((prev) =>
                    prev ? { ...prev, rateLimitWindowSeconds: n } : prev
                  );
                }}
                onBlur={() =>
                  debouncedUpdate(
                    "rateLimitWindowSeconds",
                    settings.rateLimitWindowSeconds
                  )
                }
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="rate-max">Max requests</Label>
              <Input
                id="rate-max"
                type="number"
                min={10}
                max={10000}
                value={settings.rateLimitMaxRequests}
                disabled={!settings.rateLimitEnabled}
                onChange={(e) => {
                  const n = clampNumber(Number(e.target.value || 0), 10, 10000);
                  setSettings((prev) =>
                    prev ? { ...prev, rateLimitMaxRequests: n } : prev
                  );
                }}
                onBlur={() =>
                  debouncedUpdate(
                    "rateLimitMaxRequests",
                    settings.rateLimitMaxRequests
                  )
                }
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Example: 120 requests per 60 seconds.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
