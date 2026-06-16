// features/campaigns/builder/components/step-indicator.tsx
"use client";

import { STEPS } from "../types/builder.types";
import type { Step } from "../types/builder.types";

type Props = { step: Step };

export function StepIndicator({ step }: Props) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((s, i) => (
        <div key={s.id} className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div
              className={`h-6 w-6 rounded-full flex items-center justify-center
                text-xs font-medium transition-colors ${
                  step === s.id
                    ? "bg-primary text-primary-foreground"
                    : step > s.id
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                }`}
            >
              {s.id}
            </div>
            <span
              className={`text-sm hidden sm:block ${
                step === s.id
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`h-px w-6 ${
                step > s.id ? "bg-primary/40" : "bg-border"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
