"use client";

import { DataTable } from "@/shared/ui/data-table";
import type { ContactEmailRow } from "../types/contact-email.type";
import { contactEmailColumns } from "./contact-email-columns";
import { useRouter } from "next/navigation";

export function ContactEmailsTable({ data }: { data: ContactEmailRow[] }) {
  const router = useRouter();
  return (
    <DataTable
      columns={contactEmailColumns}
      data={data}
      filterKey="name"
      onRowClick={(data) => router.push(`/contact-emails/${data.id}`)}
      filterPlaceholder="Search messages..."
      defaultPageSize={20}
      pageSizeOptions={[10, 20, 50, 100]}
      allowCustomPageSize
    />
  );
}
