// features/api-keys/ui/api-keys-client.tsx
"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import PageHeader from "@/shared/ui/page-header";
import Loading from "@/shared/ui/loading";
import { EmptyState } from "@/shared/ui/empty-state";
import { Button } from "@/shared/ui/button";
import { useGetApiKeys, useRevokeApiKey } from "../hooks/use-api-keys";
import { CreateApiKeyModal } from "./create-api-key-modal";

import { DataTable } from "@/shared/ui/data-table";
import { ApiKeysMobileRow } from "./api-keys-mobile-row";
import type { ApiKeyRow } from "../types/api-keys.type";
import { apiKeysColumns } from "./api-keys.columns";

export default function ApiKeysClient() {
  const { data: session } = useSession();
  const axios = useAxiosAuth();

  const [createOpen, setCreateOpen] = useState(false);

  const { data: keys, isLoading, error } = useGetApiKeys(session, axios);
  const revoke = useRevokeApiKey(session, axios);

  const rows: ApiKeyRow[] = keys ?? [];
  const cols = useMemo(() => apiKeysColumns(), []);

  if (isLoading) return <Loading />;

  if (error) {
    return (
      <EmptyState
        title="Failed to load API keys"
        description="Your API keys could not be loaded."
        secondaryAction={{
          label: "Retry",
          onClick: () => window.location.reload(),
        }}
      />
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="API Keys"
          description="Create and revoke keys for tenant access."
        />
        <Button onClick={() => setCreateOpen(true)}>Create key</Button>
      </div>

      <CreateApiKeyModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />

      {rows.length === 0 ? (
        <EmptyState
          title="No API keys yet"
          description="Create an API key to access API endpoints."
          primaryAction={{
            label: "Create key",
            onClick: () => setCreateOpen(true),
          }}
        />
      ) : (
        <DataTable
          columns={cols}
          data={rows}
          filterKey="name"
          filterPlaceholder="Search keys..."
          mobileRow={ApiKeysMobileRow}
          tableMeta={{
            onRevoke: (id: string) => revoke.mutate(id),
            revokePending: revoke.isPending,
          }}
        />
      )}
    </section>
  );
}
