// features/subscriptions/components/billing-client.tsx
"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import PageHeader from "@/shared/ui/page-header";
import Loading from "@/shared/ui/loading";
import { SectionHeading } from "@/shared/ui/section-heading";
import { Button } from "@/shared/ui/button";
import { format, parseISO, isValid, differenceInDays } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { CreditCard, Zap, ArrowUpRight, RefreshCw, Clock } from "lucide-react";
import { toast } from "sonner";
import {
  useGetBillingSummary,
  useVerifySubscription,
  useRenewSubscription,
} from "../hooks/use-subscriptions";
import { StatusBadge } from "./status-badge";
import type { CompanySubscription } from "../types/subscriptions.types";
import { BillingHistory } from "./billing-history";

export default function BillingClient() {
  const { data: session, status: authStatus } = useSession();
  const axios = useAxiosAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const verifiedRef = useRef(false);

  const {
    data: summary,
    isLoading,
    refetch,
  } = useGetBillingSummary(session, axios);

  const verifySubscription = useVerifySubscription(session, axios);
  const renewSubscription = useRenewSubscription(session, axios);

  // ── Handle return from Paystack ───────────────────────────
  useEffect(() => {
    if (authStatus !== "authenticated") return;
    if (verifiedRef.current) return;

    const subSuccess = searchParams.get("sub");
    const reference =
      searchParams.get("reference") ?? searchParams.get("trxref");

    if (subSuccess !== "success" || !reference) return;

    verifiedRef.current = true;
    window.history.replaceState({}, "", "/billing");

    verifySubscription
      .mutateAsync(reference)
      .then(() => {
        toast.success("Subscription activated! Welcome to MyCenta.");
        refetch();
      })
      .catch((err: unknown) => {
        toast.error(
          err instanceof Error
            ? err.message
            : "Payment received but activation failed. Please contact support.",
        );
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authStatus]);

  const handleRenew = async () => {
    try {
      const result = await renewSubscription.mutateAsync();
      window.location.href = result.authorizationUrl;
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to initiate renewal",
      );
    }
  };

  if (authStatus === "loading" || isLoading) return <Loading />;

  const { subscription, topups = [], invoices = [] } = summary ?? {};

  return (
    <section className="space-y-8 max-w-4xl">
      <PageHeader
        title="Billing"
        description="Manage your subscription and payment history."
      />

      {subscription ? (
        <CurrentPlanSection
          subscription={subscription}
          onChangePlan={() => router.push("/billing/plans")}
          onRenew={handleRenew}
          isRenewing={renewSubscription.isPending}
        />
      ) : (
        <div className="rounded-lg border border-dashed p-8 text-center space-y-3">
          <p className="text-sm font-medium">No active subscription</p>
          <p className="text-xs text-muted-foreground">
            Choose a plan to unlock all features.
          </p>
          <Button onClick={() => router.push("/billing/plans")}>
            View plans
          </Button>
        </div>
      )}

      <BillingHistory topups={topups} invoices={invoices} isLoading={false} />
    </section>
  );
}

// ── Current plan section — unchanged ─────────────────────────
function CurrentPlanSection({
  subscription,
  onChangePlan,
  onRenew,
  isRenewing,
}: {
  subscription: CompanySubscription;
  onChangePlan: () => void;
  onRenew: () => void;
  isRenewing: boolean;
}) {
  const { plan, status, billingCycle, currentPeriodEnd, trialEndsAt } =
    subscription;

  const endDate = trialEndsAt ?? currentPeriodEnd;
  const daysLeft = endDate
    ? differenceInDays(new Date(endDate), new Date())
    : null;

  const isCustom = plan.name === "Custom";
  const isTrialing = status === "trialing";
  const isExpired = ["expired", "cancelled"].includes(status);
  const isPastDue = status === "past_due";

  const formattedEnd = (iso: string | null) => {
    if (!iso) return "—";
    const d = parseISO(iso);
    return isValid(d) ? format(d, "MMM d, yyyy") : iso;
  };

  return (
    <div className="space-y-4">
      <SectionHeading>Current plan</SectionHeading>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="relative px-6 pt-6 pb-8 bg-linear-to-br from-primary/10 via-primary/5 to-background">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">{plan.name}</h2>
                <StatusBadge status={status} />
              </div>
              <p className="text-sm text-muted-foreground">
                {plan.description}
              </p>
              {daysLeft !== null && daysLeft >= 0 && (
                <div className="flex items-center gap-1.5 text-sm">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {isTrialing
                      ? `Trial ends in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`
                      : `Renews in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`}
                  </span>
                </div>
              )}
            </div>

            {plan.monthlyPriceNGN > 0 && (
              <div className="text-right shrink-0">
                <p className="text-3xl font-bold">
                  ₦{plan.monthlyPriceNGN.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  per {billingCycle === "annual" ? "year" : "month"}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t grid grid-cols-2 sm:grid-cols-4 gap-4">
          <DetailItem
            icon={<CreditCard className="h-4 w-4" />}
            label="Billing cycle"
            value={billingCycle === "annual" ? "Annual" : "Monthly"}
          />
          <DetailItem
            icon={<Zap className="h-4 w-4" />}
            label="Monthly credits"
            value={
              plan.monthlyCredits === 999999
                ? "Unlimited"
                : plan.monthlyCredits.toLocaleString()
            }
          />
          <DetailItem
            icon={<Clock className="h-4 w-4" />}
            label={isTrialing ? "Trial ends" : "Next renewal"}
            value={formattedEnd(endDate)}
          />
          <DetailItem
            icon={<RefreshCw className="h-4 w-4" />}
            label="Status"
            value={
              status === "past_due"
                ? "Past due"
                : status.charAt(0).toUpperCase() + status.slice(1)
            }
          />
        </div>

        <div className="px-6 py-4 border-t bg-muted/20 flex items-center gap-3 flex-wrap">
          {isPastDue && subscription.paystackEmailToken && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() =>
                window.open(
                  `https://paystack.com/manage/subscriptions/${subscription.paystackEmailToken}`,
                  "_blank",
                )
              }
            >
              Fix payment
            </Button>
          )}

          {isExpired && (
            <Button size="sm" onClick={onChangePlan}>
              Resubscribe
            </Button>
          )}

          {isTrialing && !isCustom && (
            <Button size="sm" onClick={onChangePlan} className="gap-1.5">
              <ArrowUpRight className="h-3.5 w-3.5" />
              Upgrade now
            </Button>
          )}

          {!isTrialing && !isExpired && !isCustom && (
            <Button
              size="sm"
              variant="outline"
              onClick={onChangePlan}
              className="gap-1.5"
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
              Change plan
            </Button>
          )}

          {!isTrialing && !isExpired && !isCustom && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={onRenew}
              isLoading={isRenewing}
              disabled={isRenewing}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Renew now
            </Button>
          )}

          {isCustom && (
            <p className="text-xs text-muted-foreground">
              You are on a custom enterprise plan. Contact us to make changes.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <p className="text-xs">{label}</p>
      </div>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
