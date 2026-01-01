"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { SortableHeader } from "@/shared/ui/sortable-header";
import { format } from "date-fns";
import type { Payment, PaymentStatus } from "../types/payment.type";
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

export const paymentColumns = (opts?: {
  onReceipt?: (paymentId: string) => void;
  receiptLoadingId?: string | null;
}): ColumnDef<Payment>[] => [
  {
    accessorKey: "createdAt",
    header: ({ column }) => <SortableHeader column={column} title="Date" />,
    cell: ({ row }) => {
      const v = row.original.createdAt;
      return v ? format(new Date(v), "dd MMM yyyy") : "—";
    },
  },
  {
    accessorKey: "method",
    header: ({ column }) => <SortableHeader column={column} title="Method" />,
    cell: ({ row }) => {
      const method = row.original.method;
      return PAYMENT_METHOD_LABEL[method] ?? method ?? "—";
    },
  },
  {
    id: "invoice",
    header: () => "Invoice",
    cell: ({ row }) => {
      const invoiceId = row.original.invoiceId;
      if (!invoiceId) return "—";
      return (
        <Link
          href={`/sales/invoices/${invoiceId}`}
          className="text-primary underline"
          onClick={(e) => e.stopPropagation()}
        >
          View
        </Link>
      );
    },
  },
  {
    id: "order",
    header: () => "Order",
    cell: ({ row }) => {
      const orderId = row.original.orderId;
      if (!orderId) return "—";
      return (
        <Link
          href={`/sales/orders/${orderId}`}
          className="text-primary underline"
          onClick={(e) => e.stopPropagation()}
        >
          View
        </Link>
      );
    },
  },
  {
    accessorKey: "amountMinor",
    header: ({ column }) => <SortableHeader column={column} title="Amount" />,
    cell: ({ row }) =>
      formatMoneyNGN(
        minorToMajor(row.original.amountMinor),
        row.original.currency
      ),
  },
  {
    accessorKey: "reference",
    header: () => "Reference",
    cell: ({ row }) => row.original.reference ?? "—",
  },
  {
    accessorKey: "status",
    header: ({ column }) => <SortableHeader column={column} title="Status" />,
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "actions",
    header: () => "Actions",
    cell: ({ row }) => {
      const paymentId = row.original.id;
      const loading = opts?.receiptLoadingId === paymentId;

      return (
        <Button
          disabled={loading}
          onClick={(e) => {
            e.stopPropagation();
            opts?.onReceipt?.(paymentId);
          }}
          isLoading={loading}
          className="min-w-[120px] h-10"
        >
          <IoMdPrint />
          Print Receipt
        </Button>
      );
    },
  },
];
