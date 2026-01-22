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

import { FilterChips, type FilterChip } from "@/shared/ui/filter-chips";
import { LedgerMobileRow } from "./ledger-mobile-row";

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
    [tab, q],
  );

  const { data, isLoading } = useGetLedger(session, axios, params);

  if (authStatus === "loading") return <Loading />;

  const rows = data?.rows ?? [];

  const chips: FilterChip<LedgerTab>[] = [
    { value: "all", label: "All" },
    { value: "deductions", label: "Deductions" },
    { value: "reservations", label: "Reservations" },
    { value: "releases", label: "Releases" },
  ];

  return (
    <section className="space-y-6">
      <Tabs value={tab} onValueChange={(v) => setTab(v as LedgerTab)}>
        <DataTable
          columns={ledgerColumns()}
          data={isLoading ? [] : rows}
          showSearch={false}
          mobileRow={LedgerMobileRow}
          toolbarLeft={
            <>
              <div className="sm:hidden -mx-3 px-3 min-w-0">
                <FilterChips<LedgerTab>
                  value={tab}
                  onChange={setTab}
                  chips={chips}
                  wrap={false}
                  scrollable
                />
              </div>

              <div className="hidden sm:block">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="deductions">Deductions</TabsTrigger>
                  <TabsTrigger value="reservations">Reservations</TabsTrigger>
                  <TabsTrigger value="releases">Releases</TabsTrigger>
                </TabsList>
              </div>
            </>
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

        {!isLoading && rows.length === 0 ? (
          <EmptyState
            title={q.trim() ? "No results" : "No ledger movements"}
            description={
              q.trim()
                ? "Try a different search term."
                : "Once orders reserve or deduct stock, movements will appear here."
            }
          />
        ) : null}
      </Tabs>
    </section>
  );
}
