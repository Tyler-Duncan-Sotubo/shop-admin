"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import Loading from "@/shared/ui/loading";
import PageHeader from "@/shared/ui/page-header";
import { paymentColumns } from "./payment-columns";
import { useGetPayments } from "../hooks/use-payments";
import { useGeneratePaymentReceiptPdf } from "../hooks/use-payment-receipt";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import { DataTable } from "@/shared/ui/data-table";
import { PaymentsMobileRow } from "./payments-mobile-row";

export function PaymentsClient() {
  const { data: session } = useSession();
  const { activeStoreId } = useStoreScope();
  const axios = useAxiosAuth();

  const params = useMemo(
    () => ({ limit: 50, offset: 0, storeId: activeStoreId }),
    [activeStoreId],
  );

  const { data: payments = [], isLoading } = useGetPayments(
    params,
    session,
    axios,
  );

  const receiptPdf = useGeneratePaymentReceiptPdf(axios);
  const [receiptLoadingId, setReceiptLoadingId] = useState<string | null>(null);

  const onReceipt = async (paymentId: string) => {
    try {
      setReceiptLoadingId(paymentId);
      await receiptPdf.mutateAsync(paymentId);
    } finally {
      setReceiptLoadingId(null);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Payments"
        description="View payments recorded against invoices and orders."
      />

      <div className="mt-10">
        <DataTable
          columns={paymentColumns({
            onReceipt,
            receiptLoadingId,
            payments, // 👈 pass rows so allZoho check works
          })}
          data={payments}
          mobileRow={PaymentsMobileRow}
          tableMeta={{
            onReceipt,
            receiptLoadingId,
          }}
        />
      </div>
    </div>
  );
}
