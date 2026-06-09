import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { CommerceAnalyticsClient } from "@/features/analytics/overview/ui/commerce-analytics-client";
import OnboardingChecklistDrawer from "@/features/onboarding/ui/onboarding-checklist-drawer";
import { authOptions } from "@/lib/auth/auth-options";

const page = async () => {
  const session = await getServerSession(authOptions);

  const stores = await fetch(
    `${process.env.API_URL}/api/stores/accessible-stores`,
    {
      headers: {
        Authorization: `Bearer ${session?.backendTokens?.accessToken}`,
      },
      cache: "no-store",
    },
  ).then((r) => r.json());

  if (!stores?.data?.length) {
    redirect("/no-store-access");
  }

  return (
    <>
      <OnboardingChecklistDrawer />
      <CommerceAnalyticsClient />
    </>
  );
};

export default page;
