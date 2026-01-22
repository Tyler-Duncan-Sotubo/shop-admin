"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import type { Session } from "next-auth";
import type { AxiosInstance } from "axios";

import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import Loading from "@/shared/ui/loading";
import { DataTable } from "@/shared/ui/data-table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";

import { paymentColumns } from "./payment-columns";
import { useGetPayments } from "../hooks/use-payments";
import { formatMoneyNGN } from "@/shared/utils/format-to-naira";
import { minorToMajor } from "../../invoices/schema/invoice.schema";
import { PaymentsMobileRow } from "./payments-mobile-row";
import { useGeneratePaymentReceiptPdf } from "../hooks/use-payment-receipt";

type Props = {
  invoiceId: string;
  /**
   * Optional: show only confirmed payments in the summary (table still shows all).
   * If you want to filter table too, we can add a status param to the hook/api.
   */
  summaryOnlyConfirmed?: boolean;
  title?: string;
};

export function InvoicePaymentsAccordion({
  invoiceId,
  summaryOnlyConfirmed = true,
  title = "Payments received",
}: Props) {
  const [receiptLoadingId, setReceiptLoadingId] = useState<string | null>(null);
  const { data: session } = useSession();
  const axios = useAxiosAuth();

  const { data: payments = [], isLoading } = useGetPayments(
    { invoiceId, limit: 50, offset: 0 },
    session as Session | null,
    axios as AxiosInstance,
  );

  const receiptPdf = useGeneratePaymentReceiptPdf(axios);

  const onReceipt = async (paymentId: string) => {
    try {
      setReceiptLoadingId(paymentId);
      await receiptPdf.mutateAsync(paymentId);
    } finally {
      setReceiptLoadingId(null);
    }
  };

  const cols = useMemo(
    () =>
      paymentColumns({
        receiptLoadingId,
        onReceipt,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [receiptLoadingId], // onReceipt stable enough; or include receiptPdf if lint complains
  );

  const currency = payments[0]?.currency ?? "NGN";

  const totalMinor = payments
    .filter((p) => (summaryOnlyConfirmed ? p.status === "confirmed" : true))
    .reduce((sum, p) => sum + (p.amountMinor ?? 0), 0);

  const totalMajor = minorToMajor(totalMinor);

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full border rounded-md px-5 py-2 mb-10"
    >
      <AccordionItem value="payments">
        <AccordionTrigger className="text-left">
          <div className="flex w-full items-center gap-4 ">
            <div className="font-extrabold">{title}</div>
            <div className="text-sm flex gap-2 text-muted-foreground">
              <span>
                {payments.length} payment{payments.length === 1 ? "" : "s"}{" "}
                •{" "}
              </span>
              <span> {formatMoneyNGN(totalMajor, currency)}</span>
            </div>
          </div>
        </AccordionTrigger>

        <AccordionContent>
          {isLoading ? (
            <div className="py-4">
              <Loading />
            </div>
          ) : (
            <div className="mt-2">
              <DataTable
                columns={cols}
                data={payments}
                mobileRow={PaymentsMobileRow}
                // ✅ pass receipt handler + loading to mobile row via table meta
                tableMeta={{
                  onReceipt,
                  receiptLoadingId,
                }}
              />
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
