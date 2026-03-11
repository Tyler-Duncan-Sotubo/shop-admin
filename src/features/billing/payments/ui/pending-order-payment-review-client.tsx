/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import Loading from "@/shared/ui/loading";
import PageHeader from "@/shared/ui/page-header";
import { Button } from "@/shared/ui/button";
import {
  useFinalizePendingOrderBankTransferPayment,
  useGetPaymentEvidence,
  useGetPendingOrderPayment,
} from "../hooks/use-payments";

export function PendingOrderPaymentReviewClient({
  paymentId,
}: {
  paymentId: string;
}) {
  const { data: session } = useSession();
  const axios = useAxiosAuth();

  const { data: payment, isLoading } = useGetPendingOrderPayment(
    paymentId,
    session,
    axios,
  );

  const { data: evidence = [] } = useGetPaymentEvidence(
    paymentId,
    session,
    axios,
  );

  const finalize = useFinalizePendingOrderBankTransferPayment(session, axios);

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Review Bank Transfer"
        description="Verify uploaded proof before confirming payment."
      />

      <div className="rounded-xl border p-6 space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Order</p>
          <p className="font-medium">{payment.orderNumber}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Amount</p>
          <p className="font-medium">
            {payment.amountMinor} {payment.currency}
          </p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Reference</p>
          <p className="font-medium">{payment.reference ?? "—"}</p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold">Uploaded Evidence</h3>

        {evidence.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No payment evidence uploaded.
          </p>
        )}

        {evidence.map((file: any) => (
          <div key={file.id} className="border rounded-lg p-3">
            <p>{file.fileName}</p>

            <a
              href={file.url}
              target="_blank"
              rel="noreferrer"
              className="text-primary underline"
            >
              Open File
            </a>
          </div>
        ))}
      </div>

      <Button
        isLoading={finalize.isPending}
        onClick={() =>
          finalize.mutate({
            paymentId,
            evidenceRequired: true,
          })
        }
      >
        Confirm Payment
      </Button>
    </div>
  );
}
