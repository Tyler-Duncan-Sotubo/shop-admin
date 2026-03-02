/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import { MdErrorOutline } from "react-icons/md";
import { IntegrationRow } from "./analytics/types/analytics.types";
import { ZohoRow } from "./zoho/types/types";
import { AnalyticsIntegrationsPanel } from "./analytics/ui/analytics-integrations-panel";
import { ZohoIntegrationPanel } from "./zoho/ui/zoho-integration-panel";
import PageHeader from "@/shared/ui/page-header";
import Loading from "@/shared/ui/loading";

export function IntegrationsPageClient() {
  const axios = useAxiosAuth();
  const { activeStoreId } = useStoreScope();
  const { data: session } = useSession();

  const accessToken = session?.backendTokens.accessToken as string | undefined;
  const enabled = Boolean(activeStoreId && accessToken);

  const analyticsQueryKey = React.useMemo(
    () => ["integrations", "analytics", "admin", activeStoreId] as const,
    [activeStoreId],
  );
  const zohoQueryKey = React.useMemo(
    () => ["integrations", "zoho", "admin", activeStoreId] as const,
    [activeStoreId],
  );

  const analyticsQuery = useQuery({
    queryKey: analyticsQueryKey,
    enabled,
    queryFn: async () => {
      const res = await axios.get<IntegrationRow[]>(
        `/api/integrations/analytics/admin`,
        { params: { storeId: activeStoreId } },
      );
      return res.data ?? [];
    },
  });

  const zohoQuery = useQuery({
    queryKey: zohoQueryKey,
    enabled,
    queryFn: async () => {
      const res = await axios.get(`/api/integrations/zoho/admin`, {
        params: { storeId: activeStoreId },
      });
      return (res.data?.data ?? null) as ZohoRow | null;
    },
    retry: (failureCount, err: any) => {
      const code = err?.response?.status;
      if (code === 404) return false; // "not connected yet"
      return failureCount < 2;
    },
  });

  // ---------- shared page gates ----------
  if (!activeStoreId) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-2 text-yellow-700">
          <MdErrorOutline size={20} />
          <span className="font-medium">No active store selected</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Select a store to manage integrations.
        </p>
      </div>
    );
  }

  if (!accessToken) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-2 text-yellow-700">
          <MdErrorOutline size={20} />
          <span className="font-medium">Not authenticated</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Please sign in again to manage integrations.
        </p>
      </div>
    );
  }

  const zohoIsNotConnected = (zohoQuery.error as any)?.response?.status === 404;

  const isLoadingAny = analyticsQuery.isLoading || zohoQuery.isLoading;
  if (isLoadingAny) {
    return <Loading />;
  }

  const analyticsErr = analyticsQuery.isError
    ? (analyticsQuery.error as any)
    : null;
  const zohoErr =
    zohoQuery.isError && !zohoIsNotConnected ? (zohoQuery.error as any) : null;

  if (analyticsErr || zohoErr) {
    const lines: string[] = [];

    if (analyticsErr) {
      lines.push(
        String(
          analyticsErr?.response?.data?.message ??
            analyticsErr?.message ??
            "Failed to load analytics integrations",
        ),
      );
    }

    if (zohoErr) {
      lines.push(
        String(
          zohoErr?.response?.data?.message ??
            zohoErr?.message ??
            "Failed to load Zoho integration",
        ),
      );
    }

    return (
      <div className="p-8">
        <div className="flex items-center gap-2 text-red-600">
          <MdErrorOutline size={20} />
          <span className="font-medium">Error</span>
        </div>
        <div className="mt-2 space-y-1 text-sm">
          {lines.map((l, i) => (
            <p key={i}>{l}</p>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-10">
      <PageHeader
        title="Integrations"
        description="Connect third-party services to your store to automate tasks and enhance functionality."
      />
      <AnalyticsIntegrationsPanel
        rows={analyticsQuery.data ?? []}
        activeStoreId={activeStoreId}
        accessToken={accessToken}
        queryKey={analyticsQueryKey as unknown as any[]}
      />

      <ZohoIntegrationPanel
        row={zohoIsNotConnected ? null : (zohoQuery.data ?? null)}
        activeStoreId={activeStoreId}
        accessToken={accessToken}
        queryKey={zohoQueryKey as unknown as any[]}
      />
    </div>
  );
}
