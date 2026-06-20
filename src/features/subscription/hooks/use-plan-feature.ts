// features/subscriptions/hooks/use-plan-feature.ts
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { useGetMySubscription } from "./use-subscriptions";
import {
  planHasFeature,
  FEATURE_MIN_PLAN,
  type PlanFeatureKey,
} from "../config/plan-features.map";

export function usePlanFeature(feature: PlanFeatureKey) {
  const { data: session } = useSession();
  const axios = useAxiosAuth();

  const { data: subscription, isLoading } = useGetMySubscription(
    session,
    axios,
  );

  // Trial gets everything
  if (subscription?.status === "trialing") {
    return {
      hasAccess: true,
      isLoading,
      currentPlan: subscription.plan.name,
      requiredPlan: FEATURE_MIN_PLAN[feature],
      isTrialing: true,
    };
  }

  const planName = subscription?.plan.name ?? "Free";
  const isActive = ["active", "trialing"].includes(subscription?.status ?? "");

  const hasAccess = isActive && planHasFeature(planName, feature);

  return {
    hasAccess,
    isLoading,
    currentPlan: planName,
    requiredPlan: FEATURE_MIN_PLAN[feature],
    isTrialing: false,
  };
}
