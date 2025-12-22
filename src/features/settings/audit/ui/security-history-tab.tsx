"use client";

import Loading from "@/shared/ui/loading";
import { useSecurityHistory } from "../hooks/use-security-history";
import { AuditTable } from "./audit.table";

export default function SecurityHistoryTab({ enabled }: { enabled: boolean }) {
  const { sessionStatus, data, isLoading, isError } =
    useSecurityHistory(enabled);

  if (!enabled) return null; // don't mount / fetch until tab is active
  if (sessionStatus === "loading" || isLoading) return <Loading />;
  if (isError)
    return (
      <p className="text-sm text-destructive">
        Failed to load security history
      </p>
    );

  return <AuditTable data={data ?? []} />;
}
