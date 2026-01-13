export type OnboardingTaskKey =
  | "products_added"
  | "online_store_customization"
  | "payment_setup"
  | "shipping_setup"; // 👈 add this

export type OnboardingChecklist = Record<OnboardingTaskKey, boolean>;
