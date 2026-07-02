/**
 * Single source of truth for the enterprise/top-tier plan name.
 * If the plan is ever renamed (e.g. "Custom" → "Enterprise"),
 * update ENTERPRISE_PLAN_NAME here and nowhere else.
 */
export const ENTERPRISE_PLAN_NAME = "Enterprise" as const;

export function isEnterprisePlan(planName: string | null | undefined): boolean {
  return planName === ENTERPRISE_PLAN_NAME;
}
