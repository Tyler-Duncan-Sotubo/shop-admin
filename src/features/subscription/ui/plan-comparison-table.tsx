// features/subscriptions/components/plan-comparison-table.tsx
"use client";

import { useState } from "react";
import { Check, Minus, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/button";
import {
  PLAN_COMPARISON,
  PLAN_NAMES,
  type PlanName,
} from "../config/plan-features";

type Props = {
  currentPlanName?: string;
  onUpgrade?: (planName: PlanName) => void;
};

const PLAN_PRICES: Record<PlanName, string> = {
  Free: "₦0",
  Starter: "₦8,000",
  Growth: "₦18,000",
  Pro: "₦35,000",
};

const PLAN_DESCRIPTIONS: Record<PlanName, string> = {
  Free: "Try MyCenta free",
  Starter: "Small businesses",
  Growth: "Growing teams",
  Pro: "Scale without limits",
};

export function PlanComparisonTable({ currentPlanName, onUpgrade }: Props) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(PLAN_COMPARISON.categories.map((c) => c.label)),
  );

  const toggleCategory = (label: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  return (
    <div className="space-y-3">
      {/* ── Plan headers ── */}
      <div className="grid grid-cols-5 gap-2 sticky top-0 bg-background pt-2 pb-3 border-b z-10">
        <div /> {/* feature label column */}
        {PLAN_NAMES.map((plan) => {
          const isCurrent = currentPlanName === plan;
          return (
            <div
              key={plan}
              className={cn(
                "text-center rounded-lg p-3 space-y-1",
                isCurrent
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50",
              )}
            >
              <p className="font-semibold text-sm">{plan}</p>
              <p
                className={cn(
                  "text-lg font-bold",
                  isCurrent && "text-primary-foreground",
                )}
              >
                {PLAN_PRICES[plan]}
              </p>
              <p
                className={cn(
                  "text-xs",
                  isCurrent
                    ? "text-primary-foreground/70"
                    : "text-muted-foreground",
                )}
              >
                {PLAN_DESCRIPTIONS[plan]}
              </p>
              {isCurrent ? (
                <div className="text-xs font-medium mt-1 opacity-80">
                  Current plan
                </div>
              ) : (
                plan !== "Free" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full h-7 text-xs mt-1"
                    onClick={() => onUpgrade?.(plan)}
                  >
                    Upgrade
                  </Button>
                )
              )}
            </div>
          );
        })}
      </div>

      {/* ── Feature categories ── */}
      {PLAN_COMPARISON.categories.map((category) => {
        const isExpanded = expandedCategories.has(category.label);

        return (
          <div
            key={category.label}
            className="rounded-lg border overflow-hidden"
          >
            {/* Category header */}
            <button
              type="button"
              onClick={() => toggleCategory(category.label)}
              className="w-full flex items-center justify-between px-4 py-3
                bg-muted/30 hover:bg-muted/50 transition-colors text-left"
            >
              <p className="text-sm font-semibold">{category.label}</p>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>

            {/* Feature rows */}
            {isExpanded && (
              <div className="divide-y">
                {category.features.map((feature, idx) => (
                  <div
                    key={feature.key}
                    className={cn(
                      "grid grid-cols-5 gap-2 px-4 py-2.5 items-center",
                      idx % 2 === 0 ? "bg-background" : "bg-muted/10",
                    )}
                  >
                    {/* Feature label */}
                    <p className="text-sm text-muted-foreground">
                      {feature.label}
                    </p>

                    {/* Plan values */}
                    {PLAN_NAMES.map((plan) => {
                      const value = feature[plan];
                      const isCurrent = currentPlanName === plan;

                      return (
                        <div
                          key={plan}
                          className={cn(
                            "text-center flex items-center justify-center",
                            isCurrent && "font-medium",
                          )}
                        >
                          <FeatureValue value={value} isCurrent={isCurrent} />
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Feature value renderer ────────────────────────────────────
function FeatureValue({
  value,
  isCurrent,
}: {
  value: boolean | string;
  isCurrent: boolean;
}) {
  if (typeof value === "boolean") {
    return value ? (
      <Check
        className={cn("h-4 w-4", isCurrent ? "text-primary" : "text-green-500")}
      />
    ) : (
      <Minus className="h-4 w-4 text-muted-foreground/40" />
    );
  }

  return (
    <span
      className={cn(
        "text-sm",
        value === "—" && "text-muted-foreground/40",
        isCurrent && "text-primary font-semibold",
      )}
    >
      {value}
    </span>
  );
}
