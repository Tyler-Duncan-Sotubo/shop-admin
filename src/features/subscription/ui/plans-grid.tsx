// features/subscriptions/components/plans-grid.tsx
"use client";

import { SectionHeading } from "@/shared/ui/section-heading";
import { Button } from "@/shared/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SubscriptionPlan } from "../types/subscriptions.types";

type Props = {
  plans: SubscriptionPlan[];
  currentPlanId?: string;
};

export function PlansGrid({ plans, currentPlanId }: Props) {
  const filtered = plans.filter(
    (p) => p.name !== "Custom" && p.name !== "Free",
  );

  return (
    <div className="space-y-4">
      <SectionHeading>Upgrade your plan</SectionHeading>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isCurrent={currentPlanId === plan.id}
          />
        ))}
      </div>
    </div>
  );
}

function PlanCard({
  plan,
  isCurrent,
}: {
  plan: SubscriptionPlan;
  isCurrent: boolean;
}) {
  const f = plan.features;

  return (
    <div
      className={cn(
        "rounded-lg border p-5 space-y-4 relative",
        isCurrent && "border-primary ring-2 ring-primary/20",
      )}
    >
      {isCurrent && (
        <div className="absolute -top-2.5 left-4">
          <span className="text-xs font-medium bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
            Current plan
          </span>
        </div>
      )}

      <div className="space-y-1">
        <p className="font-semibold">{plan.name}</p>
        <p className="text-2xl font-bold">
          ₦{plan.monthlyPriceNGN.toLocaleString()}
          <span className="text-xs font-normal text-muted-foreground">
            /month
          </span>
        </p>
        {plan.annualPriceNGN > 0 && (
          <p className="text-xs text-muted-foreground">
            ₦{plan.annualPriceNGN.toLocaleString()}/year (save{" "}
            {Math.round(
              ((plan.monthlyPriceNGN * 12 - plan.annualPriceNGN) /
                (plan.monthlyPriceNGN * 12)) *
                100,
            )}
            %)
          </p>
        )}
      </div>

      <ul className="space-y-1.5 text-xs text-muted-foreground">
        <FeatureItem
          label={`${f.maxStores === 999 ? "Unlimited" : f.maxStores} store${f.maxStores === 1 ? "" : "s"}`}
        />
        <FeatureItem
          label={`${f.maxTeamMembers === 999 ? "Unlimited" : f.maxTeamMembers} team members`}
        />
        <FeatureItem
          label={`${plan.monthlyCredits.toLocaleString()} credits/month`}
        />
        <FeatureItem label="Email campaigns" enabled={f.emailCampaigns} />
        <FeatureItem label="SMS campaigns" enabled={f.sms} />
        <FeatureItem label="Analytics" enabled={f.analytics} />
        <FeatureItem label="Priority support" enabled={f.prioritySupport} />
      </ul>

      <Button
        className="w-full"
        variant={isCurrent ? "outline" : "default"}
        disabled={isCurrent}
        size="sm"
      >
        {isCurrent ? "Current plan" : "Upgrade"}
      </Button>
    </div>
  );
}

function FeatureItem({
  label,
  enabled = true,
}: {
  label: string;
  enabled?: boolean;
}) {
  return (
    <li className={cn("flex items-center gap-1.5", !enabled && "opacity-40")}>
      <Check className="h-3 w-3 shrink-0 text-primary" />
      {label}
    </li>
  );
}
