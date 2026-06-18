// features/credits/components/credits-client.tsx
"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import PageHeader from "@/shared/ui/page-header";
import Loading from "@/shared/ui/loading";
import { DataTable } from "@/shared/ui/data-table";
import { FilterChips } from "@/shared/ui/filter-chips";
import { Badge } from "@/shared/ui/badge";
import { format, parseISO, isValid } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";
import {
  useGetCreditBalance,
  useGetCreditTransactions,
} from "../hooks/use-credits";
import type { CreditChannel, CreditTransaction } from "../types/credits.types";
import { BuyCreditsModal } from "@/features/subscription/ui/buy-credits-modal";
import { Button } from "@/shared/ui/button";

type ChannelTab = "all" | "email" | "sms";

const transactionColumns: ColumnDef<CreditTransaction>[] = [
  {
    id: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.original.type;
      const variantMap: Record<string, "success" | "destructive" | "clean"> = {
        topup: "success",
        refund: "success",
        send: "destructive",
        adjustment: "clean",
      };
      return (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <Badge variant={(variantMap[type] ?? "clean") as any}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Badge>
      );
    },
  },
  {
    id: "channel",
    header: "Channel",
    cell: ({ row }) => (
      <span className="text-sm capitalize">{row.original.channel}</span>
    ),
  },
  {
    id: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = row.original.amount;
      const isPositive = amount > 0;
      return (
        <span
          className={`text-sm font-medium ${
            isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          {isPositive ? "+" : ""}
          {amount.toLocaleString()} credits
        </span>
      );
    },
  },
  {
    id: "balanceAfter",
    header: "Balance after",
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.balanceAfter.toLocaleString()}
      </span>
    ),
  },
  {
    id: "note",
    header: "Note",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.note ?? row.original.referenceType ?? "—"}
      </span>
    ),
  },
  {
    id: "date",
    header: "Date",
    cell: ({ row }) => {
      const iso = row.original.createdAt;
      if (!iso) return <span className="text-sm">—</span>;
      const date = parseISO(iso);
      return (
        <span className="text-sm">
          {isValid(date) ? format(date, "MMM d, yyyy · h:mm a") : iso}
        </span>
      );
    },
  },
];

export default function CreditsClient() {
  const { data: session, status: authStatus } = useSession();
  const owner = session?.user?.role === "owner";
  const axios = useAxiosAuth();
  const [buyOpen, setBuyOpen] = useState(false);

  const [tab, setTab] = useState<ChannelTab>("all");

  const params = useMemo(
    () => ({
      channel: tab === "all" ? undefined : (tab as CreditChannel),
      limit: 50,
      offset: 0,
    }),
    [tab],
  );

  const { data: balance, isLoading: balanceLoading } = useGetCreditBalance(
    session,
    axios,
  );

  const { data: transactions, isLoading: txLoading } = useGetCreditTransactions(
    session,
    axios,
    params,
  );

  if (authStatus === "loading") return <Loading />;

  const rows = transactions?.rows ?? [];

  return (
    <section className="space-y-6">
      <PageHeader
        title="Credits"
        description="View your credit balance and usage across email and SMS."
        tooltip="Credits are consumed when campaigns are sent. 1 credit = 1 email or 1 SMS."
      >
        {owner && <Button onClick={() => setBuyOpen(true)}>Buy credits</Button>}
      </PageHeader>
      {/* ── Balance cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <BalanceCard
          label="Available balance"
          value={balance?.balance ?? 0}
          loading={balanceLoading}
          highlight
        />
        <BalanceCard
          label="Lifetime credits"
          value={balance?.lifetimeCredits ?? 0}
          loading={balanceLoading}
        />
        <BalanceCard
          label="Total used"
          value={(balance?.lifetimeCredits ?? 0) - (balance?.balance ?? 0)}
          loading={balanceLoading}
        />
      </div>
      {/* ── Transaction history ── */}
      <DataTable
        columns={transactionColumns}
        data={txLoading ? [] : rows}
        filterKey="note"
        filterPlaceholder="Search transactions..."
        emptyState={{
          title: "No transactions yet",
          description: "Credit top-ups and campaign sends will appear here.",
        }}
        toolbarLeft={
          <FilterChips<ChannelTab>
            value={tab}
            onChange={setTab}
            chips={[
              { value: "all", label: "All", count: transactions?.count },
              { value: "email", label: "Email", showZero: false },
              { value: "sms", label: "SMS", showZero: false },
            ]}
            wrap
          />
        }
      />
      <BuyCreditsModal open={buyOpen} onClose={() => setBuyOpen(false)} />
    </section>
  );
}

// ── Balance card ────────────────────────────────────────────
function BalanceCard({
  label,
  value,
  loading,
  highlight,
}: {
  label: string;
  value: number;
  loading: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-5 space-y-1 ${
        highlight ? "bg-primary text-primary-foreground" : "bg-card"
      }`}
    >
      <p
        className={`text-sm ${
          highlight ? "text-primary-foreground/70" : "text-muted-foreground"
        }`}
      >
        {label}
      </p>
      {loading ? (
        <div className="h-8 w-24 animate-pulse rounded bg-muted" />
      ) : (
        <p className="text-3xl font-semibold tracking-tight">
          {value.toLocaleString()}
        </p>
      )}
    </div>
  );
}
