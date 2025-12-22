"use client";

import { DataTable } from "@/shared/ui/data-table"; // adjust path if needed
import { auditColumns } from "./audit-columns";
import { useAuditLogs } from "../api/use-audit-logs";
import Loading from "@/shared/ui/loading";
import PageHeader from "@/shared/ui/page-header";
import { AuditLog } from "../types/audit.type";

export function AuditTable({ data = [] }: { data?: AuditLog[] }) {
  const { logs, isLoading, status } = useAuditLogs();
  if (status === "loading" || isLoading) return <Loading />;

  return (
    <section>
      {!data.length && (
        <PageHeader
          title="Audit Logs"
          description="View and search through audit logs of system activities."
          tooltip="Audit logs provide a detailed record of system activities for security and compliance purposes."
        />
      )}
      <DataTable
        columns={auditColumns}
        data={data.length ? data : logs}
        filterKey="action" // or "name" if you prefer
        filterPlaceholder="Search by action..."
      />
    </section>
  );
}
