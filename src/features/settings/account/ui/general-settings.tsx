// src/features/company-settings/general/ui/general-settings.tsx
"use client";

import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/shared/ui/card";
import Loading from "@/shared/ui/loading";
import { useGeneralSettings } from "../hooks/use-general-settings";

export default function GeneralSettingsSection() {
  const {
    sessionStatus,
    settings,
    setSettings,
    isLoading,
    isError,
    debouncedUpdate,
  } = useGeneralSettings();

  if (sessionStatus === "loading" || isLoading || !settings) return <Loading />;
  if (isError) return <p>Error loading general settings</p>;

  return (
    <div className="mt-6 space-y-6 md:w-2/3">
      {/* Store info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Store Information</CardTitle>
          <CardDescription>
            Configure your store&apos;s basic information and preferences.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="storefront-url">Storefront URL</Label>
            <Input
              id="storefront-url"
              value={settings.storefrontUrl ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                setSettings((prev) =>
                  prev ? { ...prev, storefrontUrl: value } : prev
                );
                debouncedUpdate("storefrontUrl", value);
              }}
              placeholder="https://shop.yourdomain.com"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="support-email">Support email</Label>
            <Input
              id="support-email"
              type="email"
              value={settings.supportEmail ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                setSettings((prev) =>
                  prev ? { ...prev, supportEmail: value } : prev
                );
                debouncedUpdate("supportEmail", value);
              }}
              placeholder="support@yourstore.com"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="support-phone">Support phone</Label>
            <Input
              id="support-phone"
              value={settings.supportPhone ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                setSettings((prev) =>
                  prev ? { ...prev, supportPhone: value } : prev
                );
                debouncedUpdate("supportPhone", value);
              }}
              placeholder="+234 801 234 5678"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
