import { OnboardingTaskKey } from "../types/onboarding.types";

export const onboardingTaskLabels: Record<
  OnboardingTaskKey,
  { label: string; description: string; url: string }
> = {
  payment_setup: {
    label: "Set up payments",
    description: "Enable payment methods so customers can pay at checkout.",
    url: "/settings/payments/methods",
  },

  online_store_customization: {
    label: "Customize your online store",
    description: "Add your logo, brand name, and storefront details.",
    url: "/settings/stores",
    // or: "/settings/stores?tab=branding"
  },

  shipping_setup: {
    label: "Set up shipping",
    description: "Create shipping zones and rates to deliver orders.",
    url: "/shipping",
  },

  products_added: {
    label: "Add your first products",
    description: "Create products with prices and images to start selling.",
    url: "/products?tab=products",
  },
};
