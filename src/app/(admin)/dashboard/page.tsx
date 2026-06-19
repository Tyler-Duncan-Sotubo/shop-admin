import { CommerceAnalyticsClient } from "@/features/analytics/overview/ui/commerce-analytics-client";
import OnboardingChecklistDrawer from "@/features/onboarding/ui/onboarding-checklist-drawer";
import { SubscriptionBanner } from "@/features/subscription/ui/subscription-banner";

const page = async () => {
  return (
    <>
      <OnboardingChecklistDrawer />
      <SubscriptionBanner />
      <CommerceAnalyticsClient />
    </>
  );
};

export default page;
