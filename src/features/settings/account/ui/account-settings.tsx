"use client";

import PageHeader from "@/shared/ui/page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs";
import GeneralSettingsSection from "./general-settings";
import PaymentSettingsSection from "./payment-settings";
import CheckoutSettingsSection from "./checkout-settings";
import TaxSettingsSection from "./tax-settings";
import CompanyAccountSection from "./company-settings";

export default function AccountSettings() {
  return (
    <div>
      <PageHeader
        title="Account Settings"
        description="Configure your store defaults, checkout, payments and tax preferences."
        tooltip="Manage your account details, store preferences, payments, checkout, and tax configuration."
      />

      <div className="mt-6">
        <Tabs defaultValue="account-details" className="space-y-6">
          <TabsList>
            <TabsTrigger value="account-details">Account Details</TabsTrigger>
            <TabsTrigger value="general">Store Preferences</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="checkout">Checkout</TabsTrigger>
            <TabsTrigger value="tax">Tax Details</TabsTrigger>
          </TabsList>

          <TabsContent value="account-details">
            <CompanyAccountSection />
          </TabsContent>

          <TabsContent value="general">
            <GeneralSettingsSection />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentSettingsSection />
          </TabsContent>

          <TabsContent value="checkout">
            <CheckoutSettingsSection />
          </TabsContent>

          <TabsContent value="tax">
            <TaxSettingsSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
