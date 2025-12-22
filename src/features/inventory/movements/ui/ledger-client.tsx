"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import Loading from "@/shared/ui/loading";
import PageHeader from "@/shared/ui/page-header";
import { EmptyState } from "@/shared/ui/empty-state";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs";
import { Input } from "@/shared/ui/input";
import { useDebounceCallback } from "@/shared/hooks/use-debounce";
import { P } from "@/shared/ui/typography";

import { LedgerTable } from "./ledger-table";
import { useGetLedger } from "../hooks/use-ledger";
import type { LedgerTab } from "../constants/ledger-tabs";

export default function LedgerClient() {
  const { data: session, status: authStatus } = useSession();
  const axios = useAxiosAuth();

  const [tab, setTab] = useState<LedgerTab>("all");
  const [q, setQ] = useState("");
  const [qInput, setQInput] = useState("");

  const { debounced } = useDebounceCallback((v: string) => setQ(v), 400);

  const params = useMemo(
    () => ({
      limit: 50,
      offset: 0,
      tab,
      q: q.trim() || undefined,
      // optional add later: locationId, orderId filters
    }),
    [tab, q]
  );

  const { data, isLoading } = useGetLedger(session, axios, params);

  if (authStatus === "loading" || isLoading) return <Loading />;

  const rows = data?.rows ?? [];
  const hasData = rows.length > 0;

  return (
    <section className="space-y-6">
      <PageHeader
        title="Inventory Ledger"
        description="Track inventory movements (reserve, release, deduct) over time."
        tooltip="Ledger rows are append-only and explain why inventory changed."
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as LedgerTab)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="deductions">Deductions</TabsTrigger>
          <TabsTrigger value="reservations">Reservations</TabsTrigger>
          <TabsTrigger value="releases">Releases</TabsTrigger>
        </TabsList>

        <div className="w-full sm:w-[360px] pl-12 ml-auto">
          <P className="text-muted-foreground text-xs mb-2">
            Tip: search “order” or a short ID fragment.
          </P>
          <Input
            value={qInput}
            onChange={(e) => {
              const value = e.target.value;
              setQInput(value);
              debounced(value);
            }}
            placeholder="Search note or meta..."
          />
        </div>

        <TabsContent value={tab} className="mt-4">
          {!hasData ? (
            <EmptyState
              title="No ledger movements"
              description="Once orders reserve or deduct stock, movements will appear here."
            />
          ) : (
            <>
              <LedgerTable data={rows} />
            </>
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
}
