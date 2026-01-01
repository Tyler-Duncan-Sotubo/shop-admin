"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { DataTable } from "@/shared/ui/data-table";
import Loading from "@/shared/ui/loading";
import PageHeader from "@/shared/ui/page-header";
import { paymentColumns } from "./payment-columns";
import { useGetPayments } from "../hooks/use-payments";
import { useGeneratePaymentReceiptPdf } from "../hooks/use-payment-receipt";
import { useStoreScope } from "@/lib/providers/store-scope-provider";

export function openPdfUrl(pdfUrl: string) {
  window.open(pdfUrl, "_blank", "noopener,noreferrer");
}

export function PaymentsClient() {
  const { data: session } = useSession();
  const { activeStoreId } = useStoreScope();
  const axios = useAxiosAuth();

  const { data: payments = [], isLoading } = useGetPayments(
    { limit: 50, offset: 0, storeId: activeStoreId },
    session,
    axios
  );

  const receiptPdf = useGeneratePaymentReceiptPdf(axios);
  const [receiptLoadingId, setReceiptLoadingId] = useState<string | null>(null);

  const cols = useMemo(
    () =>
      paymentColumns({
        receiptLoadingId,
        onReceipt: async (paymentId) => {
          try {
            setReceiptLoadingId(paymentId);
            const res = await receiptPdf.mutateAsync(paymentId);
            if (res?.pdfUrl) openPdfUrl(res.pdfUrl);
          } finally {
            setReceiptLoadingId(null);
          }
        },
      }),
    [receiptLoadingId, receiptPdf]
  );

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Payments"
        description="View payments recorded against invoices and orders."
      />

      <DataTable columns={cols} data={payments} />
    </div>
  );
}
