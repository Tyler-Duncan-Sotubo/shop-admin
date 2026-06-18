// features/subscriptions/components/billing-history.tsx
"use client";

import { useState } from "react";
import { SectionHeading } from "@/shared/ui/section-heading";
import { Badge } from "@/shared/ui/badge";
import { DataTable } from "@/shared/ui/data-table";
import { FilterChips } from "@/shared/ui/filter-chips";
import { format, parseISO } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";
import type {
  CreditTopupRequest,
  SubscriptionInvoice,
} from "../types/subscriptions.types";

type HistoryTab = "all" | "subscription" | "credit_topup";

// ── Unified row type ──────────────────────────────────────────
type BillingRow = {
  id: string;
  type: "subscription" | "credit_topup";
  description: string;
  amountNGN: number;
  status: string;
  reference: string | null;
  date: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const statusVariant: Record<string, any> = {
  paid: "success",
  pending: "clean",
  failed: "destructive",
  refunded: "clean",
};

const typeLabel: Record<string, string> = {
  subscription: "Subscription",
  credit_topup: "Credits",
};

const columns: ColumnDef<BillingRow>[] = [
  {
    id: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{row.original.description}</p>
        <Badge variant="default" className="text-xs py-0">
          {typeLabel[row.original.type]}
        </Badge>
      </div>
    ),
  },
  {
    id: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <p className="font-medium">₦{row.original.amountNGN.toLocaleString()}</p>
    ),
  },
  {
    id: "reference",
    header: "Reference",
    cell: ({ row }) => (
      <p className="text-xs text-muted-foreground font-mono">
        {row.original.reference ?? "—"}
      </p>
    ),
  },
  {
    id: "date",
    header: "Date",
    cell: ({ row }) => (
      <p className="text-sm text-muted-foreground">
        {format(parseISO(row.original.date), "MMM d, yyyy")}
      </p>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge variant={statusVariant[status] ?? "clean"}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
  },
];

type Props = {
  topups: CreditTopupRequest[];
  invoices: SubscriptionInvoice[];
  isLoading: boolean;
};

export function BillingHistory({ topups, invoices, isLoading }: Props) {
  const [tab, setTab] = useState<HistoryTab>("all");

  // ── Normalise into unified rows ───────────────────────────
  const topupRows: BillingRow[] = topups.map((t) => ({
    id: t.id,
    type: "credit_topup",
    description: `${t.credits.toLocaleString()} credits`,
    amountNGN: t.amountNGN,
    status: t.status,
    reference: t.paystackReference,
    date: t.paidAt ?? t.createdAt,
  }));

  const invoiceRows: BillingRow[] = invoices.map((inv) => ({
    id: inv.id,
    type: inv.type,
    description:
      inv.type === "subscription"
        ? "Subscription payment"
        : `${inv.type} payment`,
    amountNGN: inv.amountNGN,
    status: inv.status,
    reference: inv.paystackReference,
    date: inv.paidAt ?? inv.createdAt,
  }));

  const allRows = [...topupRows, ...invoiceRows].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const filtered =
    tab === "all" ? allRows : allRows.filter((r) => r.type === tab);

  return (
    <div className="space-y-4">
      <SectionHeading>Billing history</SectionHeading>
      <DataTable
        columns={columns}
        data={isLoading ? [] : filtered}
        filterKey="reference"
        filterPlaceholder="Search by reference..."
        emptyState={{
          title: "No billing history",
          description:
            "Subscription payments and credit purchases will appear here.",
        }}
        toolbarLeft={
          <FilterChips<HistoryTab>
            value={tab}
            onChange={setTab}
            chips={[
              { value: "all", label: "All", count: allRows.length },
              {
                value: "subscription",
                label: "Subscriptions",
                showZero: false,
              },
              { value: "credit_topup", label: "Credits", showZero: false },
            ]}
            wrap
          />
        }
      />
    </div>
  );
}
