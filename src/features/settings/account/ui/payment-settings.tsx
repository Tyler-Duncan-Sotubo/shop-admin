// src/features/company-settings/payments/ui/payment-settings.tsx
"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/shared/ui/card";
import { Label } from "@/shared/ui/label";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/ui/select";
import { Switch } from "@/shared/ui/switch"; // 👈 NEW
import Loading from "@/shared/ui/loading";

import { usePaymentSettings } from "../hooks/use-payment-settings";
import {
  paymentProviderOptions,
  manualPaymentOptions,
} from "../config/payment-settings.config";

export default function PaymentSettingsSection() {
  const {
    sessionStatus,
    settings,
    setSettings,
    debouncedUpdate,
    isLoading,
    isError,
  } = usePaymentSettings();

  if (sessionStatus === "loading" || isLoading || !settings) return <Loading />;
  if (isError) return <p>Error loading payment settings</p>;

  return (
    <div className="space-y-6 md:w-2/3">
      {/* Payment Providers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Payment Providers</CardTitle>
          <CardDescription>
            Configure your payment providers and settings below.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="space-y-4">
            <Label>Enabled Providers</Label>

            <div className="space-y-2">
              {paymentProviderOptions.map((provider) => {
                const active = settings.enabledProviders.includes(
                  provider.value
                );

                return (
                  <div key={provider.value} className="flex items-center gap-3">
                    <Checkbox
                      checked={active}
                      onCheckedChange={(checked) => {
                        const updated = checked
                          ? [...settings.enabledProviders, provider.value]
                          : settings.enabledProviders.filter(
                              (p) => p !== provider.value
                            );

                        setSettings((prev) =>
                          prev ? { ...prev, enabledProviders: updated } : prev
                        );

                        debouncedUpdate("enabledProviders", updated);
                      }}
                    />
                    <span>{provider.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-1">
            <Label>Default Provider</Label>
            <Select
              value={settings.defaultProvider}
              onValueChange={(value) =>
                debouncedUpdate("defaultProvider", value)
              }
            >
              <SelectTrigger className="h-11 px-4 text-base">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>

              <SelectContent className="w-[400px]">
                {paymentProviderOptions
                  .filter((p) => settings.enabledProviders.includes(p.value))
                  .map((provider) => (
                    <SelectItem key={provider.value} value={provider.value}>
                      {provider.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Manual Payments as toggles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Manual Payments</CardTitle>
          <CardDescription>
            Enable offline or alternative payment methods customers can use.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {manualPaymentOptions.map((method) => {
            const active = settings.manualPaymentMethods.includes(method.value);

            return (
              <div
                key={method.value}
                className="flex items-center justify-between gap-3"
              >
                <Label htmlFor={`manual-${method.value}`}>{method.label}</Label>
                <Switch
                  id={`manual-${method.value}`}
                  checked={active}
                  onCheckedChange={(checked) => {
                    const updated = checked
                      ? [...settings.manualPaymentMethods, method.value]
                      : settings.manualPaymentMethods.filter(
                          (m) => m !== method.value
                        );

                    setSettings((prev) =>
                      prev ? { ...prev, manualPaymentMethods: updated } : prev
                    );

                    debouncedUpdate("manualPaymentMethods", updated);
                  }}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Additional Options as toggles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Additional Options</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <Label htmlFor="allow-partial-payments">
                Allow partial payments
              </Label>
              <p className="text-xs text-muted-foreground max-w-md">
                Let customers pay a deposit or split their payments over time.
              </p>
            </div>

            <Switch
              id="allow-partial-payments"
              checked={settings.allowPartialPayments}
              onCheckedChange={(checked) => {
                setSettings((prev) =>
                  prev ? { ...prev, allowPartialPayments: !!checked } : prev
                );
                debouncedUpdate("allowPartialPayments", !!checked);
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
