"use client";

import Link from "next/link";
import type { DataTableMobileRowProps } from "@/shared/ui/data-table";
import type { Invoice } from "../types/invoice.type";
import { Badge } from "@/shared/ui/badge";
import { minorToMajor } from "../schema/invoice.schema";
import { formatMoneyNGN } from "@/shared/utils/format-to-naira";
import { format } from "date-fns";

function StatusBadge({ status }: { status: string }) {
  if (status === "paid") return <Badge>Paid</Badge>;
  if (status === "draft") return <Badge variant="secondary">Draft</Badge>;
  if (status === "issued") return <Badge variant="outline">Issued</Badge>;
  if (status === "partially_paid")
    return <Badge variant="outline">Partially paid</Badge>;
  return <Badge variant="secondary">{status}</Badge>;
}

export function InvoicesMobileRow({
  row,
  onRowClick,
}: DataTableMobileRowProps<Invoice>) {
  const inv = row.original;

  const date = inv.createdAt
    ? format(new Date(inv.createdAt), "dd MMM yyyy")
    : "—";
  const number = inv.number ?? "—";

  const amount = formatMoneyNGN(minorToMajor(inv.totalMinor), inv.currency);
  const balance = formatMoneyNGN(minorToMajor(inv.balanceMinor), inv.currency);

  const orderNumber = (inv.meta?.orderNumber ?? "") as string;
  const orderId = inv.orderId;

  return (
    <div
      className={[
        "p-4",
        onRowClick ? "cursor-pointer active:bg-muted/40" : "",
      ].join(" ")}
      onClick={() => onRowClick?.(inv)}
    >
      {/* Top line: Invoice# + status */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-medium truncate">Invoice {number}</div>
          <div className="mt-1 text-xs text-muted-foreground">{date}</div>
        </div>

        <div className="shrink-0">
          <StatusBadge status={inv.status} />
        </div>
      </div>

      {/* Details */}
      <div className="mt-3 space-y-2">
        {orderNumber && orderId ? (
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">Order</span>
            <Link
              href={`/sales/orders/${orderId}`}
              className="text-sm font-medium text-primary underline"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {orderNumber}
            </Link>
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">Amount</span>
          <span className="text-sm font-medium">{amount}</span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">Balance due</span>
          <span className="text-sm font-medium">{balance}</span>
        </div>
      </div>
    </div>
  );
}
