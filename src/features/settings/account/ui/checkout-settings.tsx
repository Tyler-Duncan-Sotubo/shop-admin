"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";
import { Input } from "@/shared/ui/input";
import Loading from "@/shared/ui/loading";

import { useCheckoutSettings } from "../hooks/use-checkout-settings";

export default function CheckoutSettingsSection() {
  const {
    sessionStatus,
    settings,
    setSettings,
    debouncedUpdate,
    isLoading,
    isError,
  } = useCheckoutSettings();

  if (sessionStatus === "loading" || isLoading || !settings) return <Loading />;
  if (isError) return <p>Error loading checkout settings</p>;

  return (
    <div className="space-y-6 md:w-2/3">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Checkout Settings</CardTitle>
        </CardHeader>

        <CardContent className="space-y-7">
          {/* Guest Checkout */}
          <div className="flex items-center justify-between">
            <Label>Allow Guest Checkout</Label>
            <Switch
              checked={settings.allowGuestCheckout}
              onCheckedChange={(checked) => {
                setSettings((prev) =>
                  prev ? { ...prev, allowGuestCheckout: !!checked } : prev
                );
                debouncedUpdate("allowGuestCheckout", !!checked);
              }}
            />
          </div>

          {/* Require Phone */}
          <div className="flex items-center justify-between">
            <Label>Require Phone Number</Label>
            <Switch
              checked={settings.requirePhone}
              onCheckedChange={(checked) => {
                setSettings((prev) =>
                  prev ? { ...prev, requirePhone: !!checked } : prev
                );
                debouncedUpdate("requirePhone", !!checked);
              }}
            />
          </div>

          {/* Order Comments */}
          <div className="flex items-center justify-between">
            <Label>Enable Order Comments</Label>
            <Switch
              checked={settings.enableOrderComments}
              onCheckedChange={(checked) => {
                setSettings((prev) =>
                  prev ? { ...prev, enableOrderComments: !!checked } : prev
                );
                debouncedUpdate("enableOrderComments", !!checked);
              }}
            />
          </div>

          {/* Auto Capture */}
          <div className="flex items-center justify-between">
            <Label>Auto Capture Payment</Label>
            <Switch
              checked={settings.autoCapturePayment}
              onCheckedChange={(checked) => {
                setSettings((prev) =>
                  prev ? { ...prev, autoCapturePayment: !!checked } : prev
                );
                debouncedUpdate("autoCapturePayment", !!checked);
              }}
            />
          </div>

          {/* Cart TTL */}
          <div className="space-y-3">
            <Label>Cart Expiration (minutes)</Label>
            <Input
              type="number"
              className="w-40"
              value={settings.cartTtlMinutes}
              onChange={(e) => {
                const value = Number(e.target.value) || 0;
                setSettings((prev) =>
                  prev ? { ...prev, cartTtlMinutes: value } : prev
                );
                debouncedUpdate("cartTtlMinutes", value);
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
