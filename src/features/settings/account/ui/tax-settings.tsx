"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/ui/select";
import Loading from "@/shared/ui/loading";

import { useTaxSettings } from "../hooks/use-tax-settings";

export default function TaxSettingsSection() {
  const {
    sessionStatus,
    settings,
    setSettings,
    debouncedUpdate,
    isLoading,
    isError,
  } = useTaxSettings();

  if (sessionStatus === "loading" || isLoading || !settings) return <Loading />;

  if (isError) return <p>Error loading tax settings</p>;

  return (
    <div className="space-y-6 md:w-2/3">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Tax Settings</CardTitle>
        </CardHeader>

        <CardContent className="space-y-7">
          {/* Include Tax in Prices */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Prices include tax</Label>
              <Switch
                checked={settings.pricesIncludeTax}
                onCheckedChange={(checked) => {
                  setSettings((prev) =>
                    prev ? { ...prev, pricesIncludeTax: !!checked } : prev
                  );
                  debouncedUpdate("pricesIncludeTax", !!checked);
                }}
              />
            </div>

            {/* Charge Tax */}
            <div className="flex items-center justify-between">
              <Label>Charge tax</Label>
              <Switch
                checked={settings.chargeTax}
                onCheckedChange={(checked) => {
                  setSettings((prev) =>
                    prev ? { ...prev, chargeTax: !!checked } : prev
                  );
                  debouncedUpdate("chargeTax", !!checked);
                }}
              />
            </div>
          </div>

          {/* Default Country */}
          <div className="space-y-3">
            <Label>Default country</Label>
            <Input
              className="w-64"
              value={settings.defaultCountry}
              onChange={(e) => {
                const value = e.target.value;
                setSettings((prev) =>
                  prev ? { ...prev, defaultCountry: value } : prev
                );
                debouncedUpdate("defaultCountry", value);
              }}
              placeholder="e.g. NG"
            />
          </div>

          {/* Default State */}
          <div className="space-y-3">
            <Label>Default state</Label>
            <Input
              className="w-64"
              value={settings.defaultState}
              onChange={(e) => {
                const value = e.target.value;
                setSettings((prev) =>
                  prev ? { ...prev, defaultState: value } : prev
                );
                debouncedUpdate("defaultState", value);
              }}
              placeholder="e.g. LA"
            />
          </div>

          {/* Rounding Strategy */}
          <div className="space-y-3">
            <Label>Rounding strategy</Label>
            <Select
              value={settings.roundingStrategy}
              onValueChange={(value) =>
                debouncedUpdate("roundingStrategy", value)
              }
            >
              <SelectTrigger className="h-11 w-64">
                <SelectValue placeholder="Select strategy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="per_line">Per line</SelectItem>
                <SelectItem value="per_order">Per order</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Enable VAT */}
          <div className="flex items-center justify-between">
            <Label>Enable VAT</Label>
            <Switch
              checked={settings.enableVat}
              onCheckedChange={(checked) => {
                setSettings((prev) =>
                  prev ? { ...prev, enableVat: !!checked } : prev
                );
                debouncedUpdate("enableVat", !!checked);
              }}
            />
          </div>

          {/* VAT Rate */}
          <div className="space-y-3">
            <Label>VAT default rate (%)</Label>
            <Input
              type="number"
              className="w-40"
              value={settings.vatDefaultRate}
              onChange={(e) => {
                const value = Number(e.target.value) || 0;
                setSettings((prev) =>
                  prev ? { ...prev, vatDefaultRate: value } : prev
                );
                debouncedUpdate("vatDefaultRate", value);
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
