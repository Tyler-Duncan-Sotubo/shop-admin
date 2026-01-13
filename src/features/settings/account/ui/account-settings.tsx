"use client";

import PageHeader from "@/shared/ui/page-header";
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
        <CompanyAccountSection />
      </div>
    </div>
  );
}
