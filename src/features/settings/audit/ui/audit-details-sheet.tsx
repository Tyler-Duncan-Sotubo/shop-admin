"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { FaEye } from "react-icons/fa";
import GenericSheet from "@/shared/ui/generic-sheet";
import { AuditLog } from "../types/audit.type";

export function AuditLogDetailsSheet({
  initialData,
}: {
  initialData: AuditLog;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <GenericSheet
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
          <FaEye size={18} />
        </Button>
      }
      title="Audit Log Details"
      description={`Action: ${initialData.action}`}
    >
      <div className="space-y-4 text-sm mt-8 p-4">
        <Detail label="User" value={initialData.name} />
        <Detail
          label="Timestamp"
          value={new Date(initialData.timestamp).toLocaleString()}
        />
        <Detail label="Entity" value={initialData.entity} />
        <Detail label="Action" value={initialData.action} />
        <Detail label="Details" value={initialData.details || "—"} />
        <Detail label="IP Address" value={initialData.ipAddress || "—"} />
        {initialData.changes && (
          <div>
            <div className="text-muted-foreground font-medium mb-1">
              Changes
            </div>
            <pre className="rounded-md bg-muted p-4 overflow-auto text-xs text-muted-foreground">
              {JSON.stringify(initialData.changes, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </GenericSheet>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-muted-foreground font-medium">{label}</div>
      <div className="text-base break-all">{value}</div>
    </div>
  );
}
