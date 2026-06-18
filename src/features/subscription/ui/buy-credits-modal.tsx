/* eslint-disable react-hooks/immutability */
// features/subscriptions/components/buy-credits-modal.tsx
"use client";

import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { toast } from "sonner";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/ui/dialog";
import {
  useGetCreditBundles,
  useInitiateTopup,
} from "../hooks/use-subscriptions";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function BuyCreditsModal({ open, onClose }: Props) {
  const { data: session } = useSession();
  const axios = useAxiosAuth();

  const { data: bundles = [], isLoading } = useGetCreditBundles(session, axios);
  const initiateTopup = useInitiateTopup(session, axios);

  const handleBuy = async (credits: number) => {
    try {
      const result = await initiateTopup.mutateAsync(credits);
      window.location.href = result.authorizationUrl;
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to initiate payment",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Buy credits</DialogTitle>
          <DialogDescription>
            Credits are used to send email and SMS campaigns. 1 credit = 1 email
            or 1 SMS.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 rounded-lg border animate-pulse bg-muted"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {bundles.map((bundle) => {
              const pricePerCredit = (
                bundle.amountNGN / bundle.credits
              ).toFixed(2);
              const isLoading = initiateTopup.isPending;

              return (
                <button
                  key={bundle.credits}
                  type="button"
                  onClick={() => handleBuy(bundle.credits)}
                  disabled={isLoading}
                  className={cn(
                    "rounded-lg border p-4 text-left space-y-2",
                    "hover:border-primary hover:shadow-sm transition-all",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-primary" />
                    <p className="text-sm font-semibold">{bundle.label}</p>
                  </div>
                  <p className="text-xl font-bold">
                    ₦{bundle.amountNGN.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ₦{pricePerCredit} per credit
                  </p>
                </button>
              );
            })}
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center">
          Secure payment via Paystack. You will be redirected to complete
          payment.
        </p>
      </DialogContent>
    </Dialog>
  );
}
