/* eslint-disable react-hooks/immutability */
// features/subscriptions/components/plans-client.tsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import PageHeader from "@/shared/ui/page-header";
import Loading from "@/shared/ui/loading";
import { Button } from "@/shared/ui/button";
import { BackButton } from "@/shared/ui/back-button";
import { Badge } from "@/shared/ui/badge";
import { toast } from "sonner";
import { Check, Minus, Sparkles, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import {
  useGetPlans,
  useGetMySubscription,
  useInitiateSubscription,
} from "../hooks/use-subscriptions";
import {
  PLAN_COMPARISON,
  PLAN_NAMES,
  type PlanName,
} from "../config/plan-features";
import type { SubscriptionPlan } from "../types/subscriptions.types";

const POPULAR_PLAN = "Growth";

export default function PlansClient() {
  const { data: session, status: authStatus } = useSession();
  const axios = useAxiosAuth();

  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">(
    "monthly",
  );
  const [detailPlan, setDetailPlan] = useState<PlanName | null>(null);
  const [upgradingPlanId, setUpgradingPlanId] = useState<string | null>(null);

  const { data: plans = [], isLoading: plansLoading } = useGetPlans(
    session,
    axios,
  );
  const { data: subscription } = useGetMySubscription(session, axios);
  const initiateSubscription = useInitiateSubscription(session, axios);

  if (authStatus === "loading" || plansLoading) return <Loading />;

  const visiblePlans = plans.filter(
    (p) => p.name !== "Custom" && p.name !== "Free",
  );

  // ── Handle upgrade ────────────────────────────────────────
  const handleUpgrade = async (planId: string, planName: string) => {
    setUpgradingPlanId(planId);
    try {
      const result = await initiateSubscription.mutateAsync({
        planId,
        billingCycle,
      });
      // redirect to Paystack checkout
      window.location.href = result.authorizationUrl;
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : `Failed to upgrade to ${planName}`,
      );
      setUpgradingPlanId(null);
    }
  };

  const getPrice = (plan: SubscriptionPlan) => {
    if (billingCycle === "annual" && plan.annualPriceNGN > 0) {
      return {
        amount: Math.round(plan.annualPriceNGN / 12),
        suffix: "/mo, billed annually",
        saving: Math.round(
          ((plan.monthlyPriceNGN * 12 - plan.annualPriceNGN) /
            (plan.monthlyPriceNGN * 12)) *
            100,
        ),
      };
    }
    return {
      amount: plan.monthlyPriceNGN,
      suffix: "/month",
      saving: 0,
    };
  };

  return (
    <div className="space-y-8">
      <BackButton href="/billing" label="Back to billing" />

      <PageHeader
        title="Choose your plan"
        description="Start with a 14-day free trial. No credit card required."
      />

      {/* ── Billing toggle ── */}
      <div className="flex items-center justify-center gap-3">
        <span
          className={cn(
            "text-sm",
            billingCycle === "monthly"
              ? "font-medium"
              : "text-muted-foreground",
          )}
        >
          Monthly
        </span>
        <button
          type="button"
          onClick={() =>
            setBillingCycle((c) => (c === "monthly" ? "annual" : "monthly"))
          }
          className={cn(
            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
            billingCycle === "annual" ? "bg-primary" : "bg-muted",
          )}
        >
          <span
            className={cn(
              "inline-block h-4 w-4 rounded-full bg-white shadow transition-transform",
              billingCycle === "annual" ? "translate-x-6" : "translate-x-1",
            )}
          />
        </button>
        <span
          className={cn(
            "text-sm",
            billingCycle === "annual" ? "font-medium" : "text-muted-foreground",
          )}
        >
          Annual
          <Badge variant="success" className="ml-1.5 text-xs py-0">
            Save up to 17%
          </Badge>
        </span>
      </div>

      {/* ── Plan cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {visiblePlans.map((plan) => {
          const isCurrent = subscription?.plan.name === plan.name;
          const isPopular = plan.name === POPULAR_PLAN;
          const price = getPrice(plan);
          const isUpgrading = upgradingPlanId === plan.id;

          return (
            <div
              key={plan.id}
              className={cn(
                "relative rounded-2xl border p-6 flex flex-col gap-5",
                "transition-shadow hover:shadow-md",
                isPopular
                  ? "border-primary shadow-lg shadow-primary/10 ring-1 ring-primary"
                  : "border-border",
                isCurrent && "ring-2 ring-primary/30",
              )}
            >
              {/* Popular badge */}
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span
                    className="inline-flex items-center gap-1 bg-primary
                    text-primary-foreground text-xs font-semibold px-3 py-1
                    rounded-full shadow"
                  >
                    <Sparkles className="h-3 w-3" />
                    Most popular
                  </span>
                </div>
              )}

              {/* Current plan badge */}
              {isCurrent && (
                <div className="absolute -top-3 right-4">
                  <span
                    className="inline-flex items-center bg-green-500 text-white
                    text-xs font-semibold px-3 py-1 rounded-full shadow"
                  >
                    Current plan
                  </span>
                </div>
              )}

              {/* Plan name + description */}
              <div className="space-y-1">
                <p className="font-bold text-lg">{plan.name}</p>
                <p className="text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="space-y-1">
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-extrabold tracking-tight">
                    ₦{price.amount.toLocaleString()}
                  </span>
                  <span className="text-sm text-muted-foreground mb-1">
                    {price.suffix}
                  </span>
                </div>
                {price.saving > 0 && (
                  <p className="text-xs text-green-600 font-medium">
                    Save {price.saving}% vs monthly
                  </p>
                )}
              </div>

              {/* Key features */}
              <ul className="space-y-2 flex-1">
                {getKeyFeatures(plan.name as PlanName).map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              {/* Actions */}
              <div className="space-y-2 pt-2">
                <Button
                  className="w-full"
                  variant={isPopular && !isCurrent ? "default" : "outline"}
                  disabled={isCurrent || isUpgrading}
                  isLoading={isUpgrading}
                  onClick={() => handleUpgrade(plan.id, plan.name)}
                  size="lg"
                >
                  {isCurrent ? "Current plan" : `Get ${plan.name}`}
                </Button>

                <button
                  type="button"
                  onClick={() => setDetailPlan(plan.name as PlanName)}
                  className="w-full flex items-center justify-center gap-1.5
                    text-xs text-muted-foreground hover:text-foreground
                    transition-colors py-1"
                >
                  <Info className="h-3.5 w-3.5" />
                  See all features
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Feature detail modal ── */}
      {detailPlan && (
        <PlanDetailModal
          planName={detailPlan}
          currentPlanName={subscription?.plan.name}
          planId={plans.find((p) => p.name === detailPlan)?.id ?? ""}
          onClose={() => setDetailPlan(null)}
          onUpgrade={handleUpgrade}
          isUpgrading={upgradingPlanId !== null}
        />
      )}
    </div>
  );
}

// ── Key features per plan ─────────────────────────────────────
function getKeyFeatures(planName: PlanName): string[] {
  const features: Record<PlanName, string[]> = {
    Free: [],
    Starter: [
      "1 store",
      "5 team members",
      "500 credits/month",
      "Email campaigns",
      "Orders & inventory",
      "Invoicing",
      "Email support",
    ],
    Growth: [
      "3 stores",
      "10 team members",
      "2,000 credits/month",
      "Email + SMS campaigns",
      "Analytics dashboard",
      "Multi-location",
      "Google Analytics & Facebook Pixel",
    ],
    Pro: [
      "Unlimited stores",
      "Unlimited team members",
      "5,000 credits/month",
      "Everything in Growth",
      "Custom domain",
      "Zoho CRM integration",
      "API access & webhooks",
      "Priority & dedicated support",
    ],
  };
  return features[planName] ?? [];
}

// ── Plan detail modal ─────────────────────────────────────────
function PlanDetailModal({
  planName,
  currentPlanName,
  planId,
  onClose,
  onUpgrade,
  isUpgrading,
}: {
  planName: PlanName;
  currentPlanName?: string;
  planId: string;
  onClose: () => void;
  onUpgrade: (planId: string, planName: string) => void;
  isUpgrading: boolean;
}) {
  const isCurrent = currentPlanName === planName;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{planName} — Full feature list</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {PLAN_COMPARISON.categories.map((category) => {
            const hasAny = category.features.some((f) => {
              const val = f[planName];
              return val !== false && val !== "—" && val !== "0";
            });

            if (!hasAny) return null;

            return (
              <div key={category.label} className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {category.label}
                </p>
                <ul className="space-y-1.5">
                  {category.features.map((f) => {
                    const val = f[planName];
                    const isIncluded =
                      val !== false && val !== "—" && val !== "0";

                    return (
                      <li
                        key={f.key}
                        className={cn(
                          "flex items-center justify-between text-sm",
                          !isIncluded && "opacity-40",
                        )}
                      >
                        <div className="flex items-center gap-2">
                          {isIncluded ? (
                            <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                          ) : (
                            <Minus className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          )}
                          {f.label}
                        </div>
                        {typeof val === "string" && val !== "—" && (
                          <span className="text-xs text-muted-foreground font-medium">
                            {val}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>

        {!isCurrent && (
          <Button
            className="w-full mt-2"
            disabled={isUpgrading}
            isLoading={isUpgrading}
            onClick={() => {
              onUpgrade(planId, planName);
              onClose();
            }}
          >
            Get {planName}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
