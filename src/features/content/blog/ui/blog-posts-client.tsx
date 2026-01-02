"use client";

import { useMemo, useState } from "react";
import { DataTable } from "@/shared/ui/data-table";
import Loading from "@/shared/ui/loading";
import PageHeader from "@/shared/ui/page-header";
import { useSession } from "next-auth/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs";
import { useGetBlogPosts } from "../hooks/use-blog-post";
import { blogPostColumns } from "./blog-posts-column";
import { BlogPostListRow } from "../types/blog-post.type";
import { Button } from "@/shared/ui/button";
import Link from "next/link";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { useBlogPostCountsForTabs } from "../hooks/use-blog-post-count";
import { TabLabel } from "@/shared/ui/tab-label";

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
    [statusTab, activeStoreId]
  );

  // ✅ list for current tab (rows + count)
  const { data: list, isLoading: isListLoading } = useGetBlogPosts(
    query,
    session
  );

  // ✅ counts for tabs (all/draft/published)
  const tabCounts = useBlogPostCountsForTabs(session, axios, {
    storeId: activeStoreId || undefined,
    // if you later add server search, pass it here too
  });

  if (authStatus === "loading" || isListLoading) return <Loading />;

  // If SSR data passed in, use it; otherwise use query data
  const rows = data.length ? data : list?.rows ?? [];

  return (
    <section className="space-y-4">
      {!data.length && (
        <PageHeader
          title="Blog posts"
          description="Write posts and link products to drive SEO and sales."
          tooltip="Posts can link products; categories can be derived from linked products."
        >
          <Link className="mr-2" href="/content/blog/new">
            <Button>Add Post</Button>
          </Link>
        </PageHeader>
      )}

      {!data.length ? (
        <Tabs
          value={statusTab}
          onValueChange={(v) => setStatusTab(v as StatusTab)}
        >
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

          <TabsContent value={statusTab} className="mt-4">
            <DataTable
              columns={blogPostColumns}
              data={rows}
              filterKey="title"
              filterPlaceholder="Search by post title..."
              defaultPageSize={20}
              pageSizeOptions={[10, 20, 50, 100]}
              allowCustomPageSize
            />
          </TabsContent>
        </Tabs>
      ) : (
        <DataTable
          columns={blogPostColumns}
          data={rows}
          filterKey="title"
          filterPlaceholder="Search by post title..."
          defaultPageSize={20}
          pageSizeOptions={[10, 20, 50, 100]}
          allowCustomPageSize
        />
      )}
    </section>
  );
}
