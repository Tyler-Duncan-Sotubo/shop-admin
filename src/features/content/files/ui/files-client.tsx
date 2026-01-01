"use client";

// src/features/media/ui/files-client.tsx
import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import Loading from "@/shared/ui/loading";
import PageHeader from "@/shared/ui/page-header";
import { DataTable } from "@/shared/ui/data-table";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import { mediaColumns } from "./media-columns";
import { useGetMediaFiles } from "../hooks/use-media";
import { FilesHeaderActions } from "./files-header-actions";

export function FilesClient() {
  const { data: session, status } = useSession();
  const { activeStoreId } = useStoreScope();
  const [search, setSearch] = useState("");

  const query = useMemo(
    () => ({
      storeId: activeStoreId || undefined,
      search: search.trim() || undefined,
      limit: 100,
    }),
    [activeStoreId, search]
  );

  const { data: rows = [], isLoading } = useGetMediaFiles(query, session);

  if (status === "loading" || isLoading) return <Loading />;

  return (
    <section className="space-y-4">
      <PageHeader
        title="Files"
        description="Upload and manage your store media files."
        tooltip="These files can be used across pages, blog posts, and product content."
      >
        <FilesHeaderActions />
      </PageHeader>

      <DataTable
        columns={mediaColumns}
        data={rows}
        filterKey="fileName"
        filterPlaceholder="Search by file name..."
        defaultPageSize={20}
        pageSizeOptions={[10, 20, 50, 100]}
        allowCustomPageSize
      />
    </section>
  );
}
