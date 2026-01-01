import { CommerceAnalyticsClient } from "@/features/analytics/overview/ui/commerce-analytics-client";
import OnboardingChecklistDrawer from "@/features/onboarding/ui/onboarding-checklist-drawer";

const page = () => {
  return (
    <>
      <OnboardingChecklistDrawer />
      <CommerceAnalyticsClient />
    </>
  );
};

export default page;
