"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import PageHeader from "@/shared/ui/page-header";
import Loading from "@/shared/ui/loading";
import { DataTable } from "@/shared/ui/data-table";
import { Button } from "@/shared/ui/button";
import { toast } from "sonner";

import { analyticsTagColumns } from "./analytics-tag-columns";
import { CreateAnalyticsTagDialog } from "./create-analytics-tag-dialog";
import {
  useCreateAnalyticsTag,
  useGetAnalyticsTags,
  useRevokeAnalyticsTag,
} from "../hooks/use-analytics-tags";
import type { AnalyticsTag } from "../types/analytics-tag.type";

function buildSnippet(tag: AnalyticsTag) {
  // if your backend returns an absolute URL snippet, use that.
  // for now we build the relative one your backend example used.
  return `<script async src="/storefront/analytics/tag.js?token=${tag.token}"></script>`;
}

export function AnalyticsTagsClient() {
  const { data: session } = useSession();
  const axios = useAxiosAuth();

  const [createOpen, setCreateOpen] = useState(false);
  const [revokeLoadingId, setRevokeLoadingId] = useState<string | null>(null);

  const { data: tags = [], isLoading } = useGetAnalyticsTags(session, axios);
  const createTag = useCreateAnalyticsTag(session, axios);
  const revokeTag = useRevokeAnalyticsTag(session, axios);

  const cols = useMemo(
    () =>
      analyticsTagColumns({
        revokeLoadingId,
        onCopySnippet: async (tag) => {
          const snippet = buildSnippet(tag);
          await navigator.clipboard.writeText(snippet);
          toast.success("Tag snippet copied");
        },
        onRevoke: async (tagId) => {
          try {
            setRevokeLoadingId(tagId);
            await revokeTag.mutateAsync(tagId);
          } finally {
            setRevokeLoadingId(null);
          }
        },
      }),
    [revokeLoadingId, revokeTag]
  );

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Analytics Tags"
        description="Generate tracking tags to embed in your storefront header."
        tooltip="Use these tags to track sessions and events. Revoke a tag if it’s compromised."
      />

      <div className="flex items-center justify-end">
        <Button onClick={() => setCreateOpen(true)}>Create tag</Button>
      </div>

      <DataTable columns={cols} data={tags} />

      <CreateAnalyticsTagDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        isLoading={createTag.isPending}
        onCreate={async (input) => {
          const created = await createTag.mutateAsync(input);
          setCreateOpen(false);

          // copy snippet immediately (nice UX)
          const snippet = created?.snippet ?? buildSnippet(created);
          await navigator.clipboard.writeText(snippet);
          toast.success("Created + copied tag snippet");
        }}
      />
    </div>
  );
}
