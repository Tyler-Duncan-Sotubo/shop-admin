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

type StatusTab = "all" | "published" | "draft";

export function BlogPostClient({ data = [] }: { data?: BlogPostListRow[] }) {
  const { data: session, status: authStatus } = useSession();
  const [statusTab, setStatusTab] = useState<StatusTab>("published");

  const query = useMemo(
    () => ({
      limit: 50,
      offset: 0,
      status: statusTab === "all" ? undefined : statusTab,
    }),
    [statusTab]
  );

  const { data: posts = [], isLoading } = useGetBlogPosts(query, session);

  if (authStatus === "loading" || isLoading) return <Loading />;

  const rows = data.length ? data : posts;

  return (
    <section className="space-y-4">
      {!data.length && (
        <PageHeader
          title="Blog posts"
          description="Write posts and link products to drive SEO and sales."
          tooltip="Posts can link products; categories can be derived from linked products."
        >
          <Link className="mr-2" href="/blog/new">
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
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
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
