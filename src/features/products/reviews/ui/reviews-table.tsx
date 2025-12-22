"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";

import Loading from "@/shared/ui/loading";
import PageHeader from "@/shared/ui/page-header";
import { DataTable } from "@/shared/ui/data-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Input } from "@/shared/ui/input";
import { useGetReviews, useReviewCounts } from "../hooks/use-reviews";
import type { Review } from "../types/review.type";
import { reviewColumns } from "./review-columns";
import { UpdateReviewModal } from "./update-review-modal";
import { useDebounceCallback } from "@/shared/hooks/use-debounce";
import { LuClock, LuList } from "react-icons/lu";
import { FaCheckCircle } from "react-icons/fa";
import { P } from "@/shared/ui/typography";

type StatusTab = "all" | "approved" | "pending";

export function ReviewsTable() {
  const { data: session, status: authStatus } = useSession();

  const [statusTab, setStatusTab] = useState<StatusTab>("pending");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [selected, setSelected] = useState<Review | null>(null);
  const [open, setOpen] = useState(false);

  const { debounced: debouncedSearch } = useDebounceCallback(
    (value: string) => {
      setSearch(value);
    },
    400
  );

  // ✅ counts are NOT dependent on statusTab (static)
  const counts = useReviewCounts(search.trim() || undefined, session);

  const query = useMemo(() => {
    const isApproved =
      statusTab === "approved"
        ? true
        : statusTab === "pending"
        ? false
        : undefined;

    return {
      limit: 50,
      offset: 0,
      isApproved, // boolean | undefined (hook converts to "true"/"false")
      search: search.trim() || undefined,
    };
  }, [statusTab, search]);

  const { data, isLoading } = useGetReviews(query, session);
  const reviews = data?.items ?? [];

  const cols = useMemo(
    () =>
      reviewColumns({
        onModerate: (r) => {
          setSelected(r);
          setOpen(true);
        },
      }),
    []
  );

  if (authStatus === "loading" || isLoading) return <Loading />;

  return (
    <section className="space-y-4">
      <PageHeader
        title="Reviews"
        description="Moderate customer reviews and control storefront visibility."
        tooltip="Use Pending to approve reviews before they appear on the storefront."
      />

      <Tabs
        value={statusTab}
        onValueChange={(v) => setStatusTab(v as StatusTab)}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger
              value="pending"
              className="flex items-center gap-2 px-4 py-2"
            >
              <LuClock className="h-4 w-4 text-yellow-500" />
              <span>Pending</span>
              {counts.pending > 0 && (
                <P className="text-primary not-first:mt-0">
                  ({counts.pending})
                </P>
              )}
            </TabsTrigger>

            <TabsTrigger
              value="approved"
              className="flex items-center gap-2 px-4 py-2"
            >
              <FaCheckCircle className="h-4 w-4 text-green-600" />
              <span>Approved</span>
              {counts.approved > 0 && (
                <P className="text-primary not-first:mt-0">
                  ({counts.approved})
                </P>
              )}
            </TabsTrigger>

            <TabsTrigger
              value="all"
              className="flex items-center gap-2 px-4 py-2"
            >
              <LuList className="h-4 w-4 text-blue-600" />
              <span>All</span>
              {counts.all > 0 && (
                <P className="text-primary not-first:mt-0">({counts.all})</P>
              )}
            </TabsTrigger>
          </TabsList>

          <div className="w-full sm:w-[360px]">
            <Input
              value={searchInput}
              onChange={(e) => {
                const value = e.target.value;
                setSearchInput(value);
                debouncedSearch(value);
              }}
              placeholder="Search name, email, or review text..."
            />
          </div>
        </div>

        <TabsContent value={statusTab} className="mt-4">
          <DataTable
            columns={cols}
            data={reviews}
            filterKey="authorName"
            filterPlaceholder="Filter by reviewer name..."
            showSearch={false}
          />
        </TabsContent>
      </Tabs>

      <UpdateReviewModal
        open={open}
        review={selected}
        onClose={() => {
          setOpen(false);
          setSelected(null);
        }}
      />
    </section>
  );
}
