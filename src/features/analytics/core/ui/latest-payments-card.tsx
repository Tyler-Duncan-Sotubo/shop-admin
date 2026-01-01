// src/features/analytics/commerce/ui/latest-payments-card.tsx
"use client";

import { Skeleton } from "@/shared/ui/skeleton";
import { Badge } from "@/shared/ui/badge";
import { formatMoneyNGN } from "@/shared/utils/format-to-naira";

type PaymentRow = {
  id: string;
  method?: string | null;
  status: string;
  amountMinor?: number | null;
  currency?: string | null;
  confirmedAt?: string | null;
};

function StatusBadge({ status }: { status: string }) {
  if (status === "paid") return <Badge>Paid</Badge>;
  if (status === "pending") return <Badge variant="secondary">Pending</Badge>;
  if (status === "failed") return <Badge variant="destructive">Failed</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

export function LatestPaymentsCard({
  rows,
  isLoading,
}: {
  rows: PaymentRow[] | null | undefined;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return <Skeleton className="h-72 w-full rounded-xl" />;
  }

  const data = rows ?? [];

  if (!data.length) {
    return (
      <div className="rounded-xl border p-6 text-center text-sm text-muted-foreground">
        No recent payments
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-4 h-full">
      <div className="mb-3 text-sm font-semibold text-muted-foreground">
        Latest payments
      </div>

      <div className="divide-y">
        {data.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between gap-4 py-3"
          >
            {/* Left */}
            <div className="min-w-0">
              <div className="gap-2">
                <div className="font-medium uppercase text-xs mb-1">
                  {p.method ?? "—"}
                </div>
                <StatusBadge status={p.status} />
              </div>
            </div>

            {/* Right */}
            <div className="shrink-0 text-right">
              <div className="text-sm font-semibold">
                {formatMoneyNGN(
                  (p.amountMinor ?? 0) / 100,
                  p.currency ?? "NGN"
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {p.confirmedAt ? new Date(p.confirmedAt).toLocaleString() : "—"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
