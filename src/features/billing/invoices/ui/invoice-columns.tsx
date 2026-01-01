"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Badge } from "@/shared/ui/badge";
import type { Invoice } from "../types/invoice.type";
import { minorToMajor } from "../schema/invoice.schema";
import { formatMoneyNGN } from "@/shared/utils/format-to-naira";
import { SortableHeader } from "@/shared/ui/sortable-header"; // adjust path if different
import { format } from "date-fns";

function StatusBadge({ status }: { status: string }) {
  if (status === "paid") return <Badge>Paid</Badge>;
  if (status === "draft") return <Badge variant="secondary">Draft</Badge>;
  if (status === "issued") return <Badge variant="outline">Issued</Badge>;
  if (status === "partially_paid")
    return <Badge variant="outline">Partially paid</Badge>;
  return <Badge variant="secondary">{status}</Badge>;
}

export const invoiceColumns = (): ColumnDef<Invoice>[] => [
  {
    accessorKey: "createdAt",
    header: ({ column }) => <SortableHeader column={column} title="Date" />,
    cell: ({ row }) => {
      const v = row.original.createdAt;
      return v ? format(new Date(v), "dd MMM yyyy") : "—";
    },
  },
  {
    accessorKey: "number",
    header: ({ column }) => <SortableHeader column={column} title="Invoice#" />,
    cell: ({ row }) => row.original.number ?? "—",
  },
  {
    id: "orderNumber",
    header: ({ column }) => <SortableHeader column={column} title="Order#" />,
    // sorting for derived values needs a sortingFn (see note below)
    cell: ({ row }) => {
      const orderNumber = row.original.meta?.orderNumber as string | undefined;
      const orderId = row.original.orderId;

      if (!orderNumber || !orderId) return "—";

      // keep this link clickable even when the row is clickable
      return (
        <Link
          href={`/sales/orders/${orderId}`}
          className="text-primary underline"
          onClick={(e) => e.stopPropagation()}
        >
          {orderNumber}
        </Link>
      );
    },
    sortingFn: (a, b) => {
      const av = (a.original.meta?.orderNumber ?? "") as string;
      const bv = (b.original.meta?.orderNumber ?? "") as string;
      return av.localeCompare(bv);
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => <SortableHeader column={column} title="Status" />,
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "totalMinor",
    header: ({ column }) => <SortableHeader column={column} title="Amount" />,
    cell: ({ row }) =>
      formatMoneyNGN(
        minorToMajor(row.original.totalMinor),
        row.original.currency
      ),
  },
  {
    accessorKey: "balanceMinor",
    header: ({ column }) => (
      <SortableHeader column={column} title="Balance Due" />
    ),
    cell: ({ row }) =>
      formatMoneyNGN(
        minorToMajor(row.original.balanceMinor),
        row.original.currency
      ),
  },
];
