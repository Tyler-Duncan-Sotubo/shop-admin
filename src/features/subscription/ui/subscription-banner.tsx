// features/subscription/components/subscription-banner.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { X, AlertTriangle, CreditCard, Clock } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/button";
import { useGetMySubscription } from "../hooks/use-subscriptions";

export function SubscriptionBanner() {
  const { data: session } = useSession();
  const axios = useAxiosAuth();
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);

  const {
    data: subscription,
    isLoading: subLoading,
    refetch: refetchSub,
  } = useGetMySubscription(session, axios);

  const user = session?.user;

  if (!subscription || dismissed) return null;

  const subscriptionWithTrial = {
    ...subscription,
    ...getTrialInfo(subscription.trialEndsAt),
  };

  console.log("subscriptionWithTrial", subscriptionWithTrial);

  const { status, trialDaysLeft, trialActive } = subscriptionWithTrial;

  const config = getBannerConfig(status, trialDaysLeft);
  if (!config) return null;

  const isDismissible = status === "trialing" || status === "active";
  const canSubscribe = user?.role === "owner";

  return (
    <div
      className={cn(
        "relative z-50 flex items-center justify-between gap-3 px-4 py-3 rounded-2xl mb-3 -mt-3",
        "text-sm font-medium w-full",
        config.className,
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <config.Icon className="h-4 w-4 shrink-0" />
        <p className="truncate">
          {config.message}
          {!canSubscribe && (
            <span className="opacity-70 ml-1">
              — contact your account owner to upgrade.
            </span>
          )}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          size="sm"
          variant="clean"
          className={cn("h-8 text-sm border-current", config.buttonClassName)}
          onClick={() => router.push(config.href)}
          disabled={!canSubscribe}
        >
          {config.cta}
        </Button>

        {isDismissible && (
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="opacity-60 hover:opacity-100 transition-opacity"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

function getBannerConfig(status: string, trialDaysLeft: number | null) {
  switch (status) {
    case "trialing":
      return {
        Icon: Clock,
        href: "/billing/plans", // ← pick a plan
        message:
          trialDaysLeft !== null && trialDaysLeft <= 3
            ? `⚠️ Your trial ends in ${trialDaysLeft} day${trialDaysLeft === 1 ? "" : "s"}. Upgrade now to keep access.`
            : `Your trial ends in ${trialDaysLeft} day${trialDaysLeft === 1 ? "" : "s"}. Upgrade to keep access.`,
        cta: "Upgrade",
        className:
          trialDaysLeft !== null && trialDaysLeft <= 3
            ? "bg-amber-500 text-white"
            : "bg-primary text-primary-foreground",
        buttonClassName:
          trialDaysLeft !== null && trialDaysLeft <= 3
            ? "border-white text-white hover:bg-amber-600"
            : "border-white text-white hover:bg-primary/90",
      };

    case "past_due":
      return {
        Icon: CreditCard,
        href: "/billing", // ← fix payment on billing page
        message:
          "Payment failed. Please update your payment method to avoid losing access.",
        cta: "Fix payment",
        className: "bg-red-500/10 text-red-500 font-bold",
        buttonClassName: "",
      };

    case "expired":
      return {
        Icon: AlertTriangle,
        href: "/billing/plans", // ← pick a plan
        message:
          "Your trial has expired. Choose a plan to continue using MyCenta.",
        cta: "Choose a plan",
        className: "bg-red-600 text-white",
        buttonClassName: "border-white text-white hover:bg-red-700",
      };

    case "cancelled":
      return {
        Icon: AlertTriangle,
        href: "/billing/plans", // ← resubscribe via plans page
        message:
          "Your subscription is cancelled. Resubscribe to restore full access.",
        cta: "Resubscribe",
        className: "bg-gray-800 text-white",
        buttonClassName: "border-white text-white hover:bg-gray-900",
      };

    default:
      return null;
  }
}

const getTrialInfo = (trialEndsAt: string | null) => {
  if (!trialEndsAt) {
    return {
      trialDaysLeft: 0,
      trialActive: false,
    };
  }

  const now = new Date();
  const trialEnd = new Date(trialEndsAt);

  const diff = trialEnd.getTime() - now.getTime();

  const trialDaysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));

  return {
    trialDaysLeft,
    trialActive: diff > 0,
  };
};
