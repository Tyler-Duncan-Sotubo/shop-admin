import { OnboardingTaskKey } from "../types/onboarding.types";

export const onboardingTaskLabels: Record<
  OnboardingTaskKey,
  { label: string; description: string; url: string }
> = {
  // 👇 NEW
  branding_setup: {
    label: "Branding & general settings",
    description:
      "Set your logo, primary colors, default currency, language, and core company details.",
    url: "/settings/account",
  },
  store_setup: {
    label: "Set up your store",
    description:
      "Configure your store name, default currency, locale, and storefront URL.",
    url: "/settings/stores",
  },
  location_setup: {
    label: "Add a location",
    description:
      "Create at least one warehouse or store location to manage stock and fulfill orders.",
    url: "/inventory/locations",
  },
  payment_setup: {
    label: "Enable payments",
    description:
      "Connect and enable at least one payment provider so customers can pay at checkout.",
    url: "/settings/account",
  },
};
