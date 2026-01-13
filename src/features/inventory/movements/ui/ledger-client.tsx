"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import Loading from "@/shared/ui/loading";
import { EmptyState } from "@/shared/ui/empty-state";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Input } from "@/shared/ui/input";
import { useDebounceCallback } from "@/shared/hooks/use-debounce";
import { DataTable } from "@/shared/ui/data-table";

import { useGetLedger } from "../hooks/use-ledger";
import type { LedgerTab } from "../constants/ledger-tabs";
import { ledgerColumns } from "./ledger-columns";

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
    }),
    [tab, q]
  );

  const { data, isLoading } = useGetLedger(session, axios, params);

  // ✅ only block when session is loading
  if (authStatus === "loading") return <Loading />;

  const rows = data?.rows ?? [];
  const hasData = rows.length > 0;

  return (
    <section className="space-y-6">
      <Tabs value={tab} onValueChange={(v) => setTab(v as LedgerTab)}>
        {!hasData && !isLoading ? (
          <EmptyState
            title="No ledger movements"
            description="Once orders reserve or deduct stock, movements will appear here."
          />
        ) : (
          <DataTable
            columns={ledgerColumns()}
            data={isLoading ? [] : rows}
            // turn off built-in search; we provide our own search in toolbarRight
            showSearch={false}
            toolbarLeft={
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="deductions">Deductions</TabsTrigger>
                <TabsTrigger value="reservations">Reservations</TabsTrigger>
                <TabsTrigger value="releases">Releases</TabsTrigger>
              </TabsList>
            }
            toolbarRight={
              <div className="w-full sm:w-[360px]">
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
            }
          />
        )}
      </Tabs>
    </section>
  );
}
