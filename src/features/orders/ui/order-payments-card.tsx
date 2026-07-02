"use client";

import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import type { AxiosInstance } from "axios";
import type { Session } from "next-auth";
import { format } from "date-fns";
import { H3 } from "@/shared/ui/typography";
import { formatMoneyNGN } from "@/shared/utils/format-to-naira";
import { minorToMajor } from "@/features/billing/invoices/schema/invoice.schema";
import { useGetPayments } from "@/features/billing/payments/hooks/use-payments";
import { useGeneratePaymentReceiptPdf } from "@/features/billing/payments/hooks/use-payment-receipt";
import { Button } from "@/shared/ui/button";
import { IoMdPrint } from "react-icons/io";
import { useState } from "react";

const METHOD_LABEL: Record<string, string> = {
  bank_transfer: "Bank Transfer",
  cash: "Cash",
  card_manual: "Card",
  gateway: "Gateway",
  other: "Other",
};

export function OrderPaymentsCard({
  orderId,
  orderTotal,
  currency,
  session,
  axios,
}: {
  orderId: string;
  orderTotal: number;
  currency: string;
  session: Session | null;
  axios: AxiosInstance;
}) {
  const [receiptLoadingId, setReceiptLoadingId] = useState<string | null>(null);
  const receiptPdf = useGeneratePaymentReceiptPdf(axios);

  const { data: payments = [] } = useGetPayments(
    { orderId, limit: 50, offset: 0 },
    session,
    axios,
  );

  const succeeded = payments.filter((p) => p.status === "succeeded");
  if (succeeded.length === 0) return null;

  const paidMinor = succeeded.reduce(
    (sum, p) => sum + (p.amountMinor ?? 0),
    0,
  );
  const paid = Number(minorToMajor(paidMinor));
  const remaining = Math.max(orderTotal - paid, 0);

  const onReceipt = async (paymentId: string) => {
    setReceiptLoadingId(paymentId);
    try {
      await receiptPdf.mutateAsync(paymentId);
    } finally {
      setReceiptLoadingId(null);
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <H3 className="text-base">Payments</H3>
        <span className="text-xs text-muted-foreground">
          {succeeded.length} recorded
        </span>
      </div>

      <div className="space-y-2">
        {succeeded.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between gap-2 text-sm"
          >
            <div className="flex flex-col min-w-0">
              <span className="font-medium truncate">
                {METHOD_LABEL[p.method] ?? p.method}
              </span>
              <span className="text-xs text-muted-foreground">
                {p.createdAt
                  ? format(new Date(p.createdAt), "dd MMM yyyy")
                  : "—"}
                {p.reference ? ` · ${p.reference}` : ""}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-semibold">
                {formatMoneyNGN(
                  Number(minorToMajor(p.amountMinor ?? 0)),
                  p.currency,
                )}
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                disabled={receiptLoadingId === p.id}
                onClick={() => onReceipt(p.id)}
                title="Print receipt"
              >
                <IoMdPrint className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-2 flex justify-between text-sm font-medium">
        <span>Paid</span>
        <span>{formatMoneyNGN(paid, currency)}</span>
      </div>
      {remaining > 0 && (
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Outstanding</span>
          <span>{formatMoneyNGN(remaining, currency)}</span>
        </div>
      )}
    </div>
  );
}
