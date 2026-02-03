// features/blog/components/blog-post-client.tsx
"use client";

import { useMemo, useState } from "react";
import { DataTable } from "@/shared/ui/data-table";
import Loading from "@/shared/ui/loading";
import PageHeader from "@/shared/ui/page-header";
import { useSession } from "next-auth/react";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { useGetBlogPosts } from "../hooks/use-blog-post";
import { blogPostColumns } from "./blog-posts-column";
import type { BlogPostListRow } from "../types/blog-post.type";
import { Button } from "@/shared/ui/button";
import Link from "next/link";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { useBlogPostCountsForTabs } from "../hooks/use-blog-post-count";
import { TabLabel } from "@/shared/ui/tab-label";
import { BlogPostsMobileRow } from "./blog-posts-mobile-row";
import { ExportMenu } from "@/shared/ui/export-menu";
import { FilterChips, type FilterChip } from "@/shared/ui/filter-chips";

type StatusTab = "all" | "published" | "draft";

export function BlogPostClient({ data = [] }: { data?: BlogPostListRow[] }) {
  const { data: session, status: authStatus } = useSession();
  const { activeStoreId } = useStoreScope();
  const axios = useAxiosAuth();

  const [statusTab, setStatusTab] = useState<StatusTab>("published");

  const query = useMemo(
    () => ({
      limit: 50,
      offset: 0,
      status: statusTab === "all" ? undefined : statusTab,
      storeId: activeStoreId || undefined,
    }),
    [statusTab, activeStoreId],
  );

  const { data: list, isLoading: isListLoading } = useGetBlogPosts(
    query,
    session,
  );

  const tabCounts = useBlogPostCountsForTabs(session, axios, {
    storeId: activeStoreId || undefined,
  });

  if (authStatus === "loading" || isListLoading) return <Loading />;

  const rows = data.length ? data : (list?.rows ?? []);

  // ✅ Mobile chips (same pattern as products)
  const chips: FilterChip<StatusTab>[] = [
    { value: "published", label: "Published", count: tabCounts.published },
    { value: "draft", label: "Draft", count: tabCounts.draft },
    { value: "all", label: "All", count: tabCounts.all },
  ];

  // ✅ toolbarRight: side-by-side on mobile, stacked on desktop
  const toolbarRight = !data.length ? (
    <div className="flex gap-2">
      <Link href="/content/blog/new" className="flex-1">
        <Button className="w-full">Add Post</Button>
      </Link>

      <ExportMenu
        exportPath="/api/blog-posts/export-posts"
        query={{
          storeId: activeStoreId || undefined,
          status: statusTab === "all" ? undefined : statusTab,
        }}
      />
    </div>
  ) : null;

  return (
    <section className="space-y-4">
      {!data.length && (
        <PageHeader
          title="Blog posts"
          description="Write posts and link products to drive SEO and sales."
          tooltip="Posts can link products; categories can be derived from linked products."
        />
      )}

      <Tabs
        value={statusTab}
        onValueChange={(v) => setStatusTab(v as StatusTab)}
      >
        <DataTable
          columns={blogPostColumns}
          data={rows}
          filterKey="title"
          filterPlaceholder="Search by post title..."
          defaultPageSize={20}
          pageSizeOptions={[10, 20, 50, 100]}
          allowCustomPageSize
          mobileRow={BlogPostsMobileRow}
          toolbarLeft={
            !data.length ? (
              <>
                {/* ✅ Mobile chips */}
                <FilterChips<StatusTab>
                  value={statusTab}
                  onChange={setStatusTab}
                  chips={chips}
                  wrap
                />

                {/* ✅ Desktop tabs */}
                <div className="hidden sm:block">
                  <TabsList>
                    <TabsTrigger value="published">
                      <TabLabel label="Published" count={tabCounts.published} />
                    </TabsTrigger>
                    <TabsTrigger value="draft">
                      <TabLabel label="Draft" count={tabCounts.draft} />
                    </TabsTrigger>
                    <TabsTrigger value="all">
                      <TabLabel label="All" count={tabCounts.all} />
                    </TabsTrigger>
                  </TabsList>
                </div>
              </>
            ) : null
          }
          toolbarRight={toolbarRight}
        />
      </Tabs>
    </section>
  );
}
