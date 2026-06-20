// features/subscriptions/components/plan-gate.tsx
"use client";

import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { usePlanFeature } from "../hooks/use-plan-feature";
import type { PlanFeatureKey } from "../config/plan-features.map";
import { cn } from "@/lib/utils";

interface PlanGateProps {
  feature: PlanFeatureKey;
  children: React.ReactNode;
  // "hide" removes it entirely, "lock" shows upgrade prompt
  mode?: "hide" | "lock";
  className?: string;
}

export function PlanGate({
  feature,
  children,
  mode = "lock",
  className,
}: PlanGateProps) {
  const { hasAccess, isLoading, currentPlan, requiredPlan } =
    usePlanFeature(feature);
  const router = useRouter();

  if (isLoading) return null;
  if (hasAccess) return <>{children}</>;
  if (mode === "hide") return null;

  return (
    <div
      className={cn(
        "relative rounded-xl border border-dashed border-border bg-muted/40",
        className,
      )}
    >
      {/* Blurred preview */}
      <div className="pointer-events-none select-none blur-sm opacity-40">
        {children}
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
        <div className="flex items-center justify-center w-10 h-10 border rounded-full bg-background">
          <Lock className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold">{requiredPlan} plan required</p>
          <p className="text-xs text-muted-foreground">
            You&apos;re on the {currentPlan} plan. Upgrade to unlock this
            feature.
          </p>
        </div>
        <Button onClick={() => router.push("/billing/plans")}>
          Upgrade to {requiredPlan}
        </Button>
      </div>
    </div>
  );
}
