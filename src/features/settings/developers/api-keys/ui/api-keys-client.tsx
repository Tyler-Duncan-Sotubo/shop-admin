"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import PageHeader from "@/shared/ui/page-header";
import Loading from "@/shared/ui/loading";
import { EmptyState } from "@/shared/ui/empty-state";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";

import { useGetApiKeys, useRevokeApiKey } from "../hooks/use-api-keys";
import { CreateApiKeyModal } from "./create-api-key-modal";

export default function ApiKeysClient() {
  const { data: session } = useSession();
  const axios = useAxiosAuth();

  const [createOpen, setCreateOpen] = useState(false);

  const { data: keys, isLoading, error } = useGetApiKeys(session, axios);
  const revoke = useRevokeApiKey(session, axios);

  const rows = keys ?? [];

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
        <div className="rounded-lg border">
          <div className="grid grid-cols-12 gap-2 border-b p-3 text-xs font-medium text-muted-foreground">
            <div className="col-span-4">Name</div>
            <div className="col-span-3">Status</div>
            <div className="col-span-3">Scopes</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {rows.map((k) => (
            <div
              key={k.id}
              className="grid grid-cols-12 gap-2 p-3 items-center"
            >
              <div className="col-span-4 font-medium">{k.name}</div>

              <div className="col-span-3">
                {k.isActive ? (
                  <Badge variant="outline">Active</Badge>
                ) : (
                  <Badge variant="secondary">Revoked</Badge>
                )}
              </div>

              <div
                className="col-span-3 text-xs truncate"
                title={(k.scopes ?? []).join(", ")}
              >
                {(k.scopes ?? []).length ? (k.scopes ?? []).join(", ") : "—"}
              </div>

              <div className="col-span-2 flex justify-end">
                <Button
                  variant="outline"
                  disabled={!k.isActive || revoke.isPending}
                  onClick={() => revoke.mutate(k.id)}
                >
                  Revoke
                </Button>
              </div>

              {(k.allowedOrigins ?? []).length ? (
                <div className="col-span-12 text-xs text-muted-foreground pt-1">
                  Allowed origins: {(k.allowedOrigins ?? []).join(", ")}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
