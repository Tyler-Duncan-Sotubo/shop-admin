// src/features/contact-emails/ui/contact-emails-table.tsx
"use client";

import { DataTable } from "@/shared/ui/data-table";
import type { ContactEmailRow } from "../types/contact-email.type";
import { contactEmailColumns } from "./contact-email-columns";
import { useRouter } from "next/navigation";
import { ContactEmailsMobileRow } from "./contact-emails-mobile-row";

export function ContactEmailsTable({ data }: { data: ContactEmailRow[] }) {
  const router = useRouter();

  return (
    <DataTable
      columns={contactEmailColumns}
      data={data}
      filterKey="name"
      filterPlaceholder="Search messages..."
      onRowClick={(row) => router.push(`/contact-emails/${row.id}`)}
      defaultPageSize={20}
      pageSizeOptions={[10, 20, 50, 100]}
      allowCustomPageSize
      mobileRow={ContactEmailsMobileRow}
    />
  );
}
