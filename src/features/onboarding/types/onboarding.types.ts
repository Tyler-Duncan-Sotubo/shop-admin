export type OnboardingTaskKey =
  | "store_setup"
  | "location_setup"
  | "payment_setup"
  | "branding_setup"; // 👈 add this

export type OnboardingChecklist = Record<OnboardingTaskKey, boolean>;
