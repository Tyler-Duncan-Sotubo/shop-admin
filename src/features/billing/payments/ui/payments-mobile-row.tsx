"use client";

import * as React from "react";
import Link from "next/link";
import type { DataTableMobileRowProps } from "@/shared/ui/data-table";
import type { Payment, PaymentStatus } from "../types/payment.type";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { format } from "date-fns";
import { formatMoneyNGN } from "@/shared/utils/format-to-naira";
import { minorToMajor } from "../../invoices/schema/invoice.schema";
import { IoMdPrint } from "react-icons/io";

function StatusBadge({ status }: { status: PaymentStatus }) {
  if (status === "confirmed") return <Badge>Confirmed</Badge>;
  if (status === "pending") return <Badge variant="secondary">Pending</Badge>;
  if (status === "failed") return <Badge variant="destructive">Failed</Badge>;
  if (status === "cancelled") return <Badge variant="outline">Cancelled</Badge>;
  return <Badge variant="secondary">{status}</Badge>;
}

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  bank_transfer: "Bank Transfer",
  cash: "Cash",
  card_manual: "Card",
  other: "Other",
};

export function PaymentsMobileRow({
  row,
  table,
  onRowClick,
}: DataTableMobileRowProps<Payment>) {
  const p = row.original;

  const date = p.createdAt ? format(new Date(p.createdAt), "dd MMM yyyy") : "—";
  const method = PAYMENT_METHOD_LABEL[p.method] ?? p.method ?? "—";
  const amount = formatMoneyNGN(minorToMajor(p.amountMinor), p.currency);
  const ref = p.reference ?? "—";

  // This expects you pass onReceipt + receiptLoadingId via meta (see PaymentsClient below)
  const meta = (table.options.meta ?? {}) as {
    onReceipt?: (paymentId: string) => void | Promise<void>;
    receiptLoadingId?: string | null;
  };

  const loading = meta.receiptLoadingId === p.id;

  return (
    <div
      className={[
        "p-4",
        onRowClick ? "cursor-pointer active:bg-muted/40" : "",
      ].join(" ")}
      onClick={() => onRowClick?.(p)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-medium truncate">{amount}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            {date} • {method}
          </div>
        </div>

        <div className="shrink-0">
          <StatusBadge status={p.status} />
        </div>
      </div>

      {/* Details */}
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">Reference</span>
          <span className="text-sm font-medium truncate max-w-[65%]">
            {ref}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">Invoice</span>
          {p.invoiceId ? (
            <Link
              href={`/sales/invoices/${p.invoiceId}`}
              className="text-sm font-medium text-primary underline"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              View
            </Link>
          ) : (
            <span className="text-sm font-medium">—</span>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">Order</span>
          {p.orderId ? (
            <Link
              href={`/sales/orders/${p.orderId}`}
              className="text-sm font-medium text-primary underline"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              View
            </Link>
          ) : (
            <span className="text-sm font-medium">—</span>
          )}
        </div>

        {/* Action */}
        <div className="pt-2">
          <Button
            disabled={loading}
            isLoading={loading}
            className="w-full h-10"
            onClick={(e) => {
              e.stopPropagation();
              meta.onReceipt?.(p.id);
            }}
          >
            <IoMdPrint />
            Print Receipt
          </Button>
        </div>
      </div>
    </div>
  );
}
