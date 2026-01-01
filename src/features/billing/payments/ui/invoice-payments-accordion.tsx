"use client";

import { useMemo } from "react";
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
  const { data: session } = useSession();
  const axios = useAxiosAuth();

  const { data: payments = [], isLoading } = useGetPayments(
    { invoiceId, limit: 50, offset: 0 },
    session as Session | null,
    axios as AxiosInstance
  );

  const cols = useMemo(() => paymentColumns(), []);

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
                {payments.length} payment{payments.length === 1 ? "" : "s"} •{" "}
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
              <DataTable columns={cols} data={payments} />
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
