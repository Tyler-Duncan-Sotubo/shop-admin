/* eslint-disable @typescript-eslint/no-explicit-any */
// features/customers/components/admin-customers-client.tsx
"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import Loading from "@/shared/ui/loading";
import PageHeader from "@/shared/ui/page-header";
import { DataTable } from "@/shared/ui/data-table";
import { EmptyState } from "@/shared/ui/empty-state";
import { useRouter } from "next/navigation";
import { useAdminCustomers } from "../hooks/use-admin-customers";
import { adminCustomersColumns } from "./admin-customers-columns";
import { FaUsers } from "react-icons/fa";
import { CreateCustomerModal } from "./create-customer-modal";
import { FaPlus } from "react-icons/fa6";
import { Button } from "@/shared/ui/button";
import { LuImport } from "react-icons/lu";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import type { AdminCustomerRow } from "../types/admin-customer.type";
import { CustomerBulkUploadModal } from "./customer-bulk-upload-modal";
import { FilterChip, FilterChips } from "@/shared/ui/filter-chips";

type CustomerTab = "all" | "customers" | "subscribers" | "inactive";

export default function AdminCustomersClient() {
  const axios = useAxiosAuth();
  const { activeStoreId } = useStoreScope();
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [tab, setTab] = useState<CustomerTab>("all");
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [open, setOpen] = useState(false);

  // Always fetch everything — filter client-side from the full list
  const query = useMemo(
    () => ({
      limit: 500,
      offset: 0,
      includeInactive: true, // always fetch inactive so the tab count is accurate
      includeSubscribers: true, // always fetch subscribers
      storeId: activeStoreId,
    }),
    [activeStoreId],
  );

  const { data, isLoading, refetch } = useAdminCustomers(query, session, axios);

  const allRows: AdminCustomerRow[] = useMemo(() => {
    if (!data) return [];
    const raw = Array.isArray(data) ? data : ((data as any).rows ?? []);
    return raw.map((r: any) => ({
      ...r,
      email: r.email ?? r.billingEmail ?? "",
      lastLogin: r.lastLogin ?? r.lastLoginAt ?? null,
      entityType: r.entityType ?? "customer",
      marketingStatus: r.marketingStatus ?? r.status ?? null,
    }));
  }, [data]);

  const counts = useMemo(
    () => ({
      all: allRows.length,
      subscribed: allRows.filter((r) => r.marketingStatus === "subscribed")
        .length,
      inactive: allRows.filter(
        (r) => r.entityType === "customer" && r.isActive === false,
      ).length,
    }),
    [allRows],
  );

  type CustomerTab = "all" | "subscribed" | "inactive";

  const chips: FilterChip<CustomerTab>[] = [
    { value: "all", label: "All", count: counts.all },
    {
      value: "subscribed",
      label: "Subscribed",
      count: counts.subscribed,
      showZero: false,
    },
    {
      value: "inactive",
      label: "Inactive",
      count: counts.inactive,
      showZero: false,
    },
  ];

  // filter
  const rows = useMemo(() => {
    switch (tab) {
      case "subscribed":
        return allRows.filter((r) => r.marketingStatus === "subscribed");
      case "inactive":
        return allRows.filter((r) => r.isActive === false);
      default:
        return allRows;
    }
  }, [allRows, tab]);

  if (authStatus === "loading" || isLoading) return <Loading />;

  if (allRows.length === 0) {
    return (
      <section className="space-y-4">
        <PageHeader
          title="Customers"
          description="Manage customers for your company."
          tooltip="Search customers by name, email, phone. View details and manage status."
        />
        <EmptyState
          icon={<FaUsers />}
          title="No customers yet"
          description="Customers will appear here once they sign up or place an order."
          primaryAction={{
            label: "Add customer",
            onClick: () => setOpen(true),
          }}
          secondaryAction={{
            label: "Import customers",
            onClick: () => setIsBulkOpen(true),
          }}
        />
        <CustomerBulkUploadModal
          isOpen={isBulkOpen}
          onClose={() => setIsBulkOpen(false)}
          endpoint={`/api/admin/customers/bulk/${activeStoreId ?? "null"}`}
          onSuccess={() => refetch()}
        />
        <CreateCustomerModal open={open} onClose={() => setOpen(false)} />
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <PageHeader
        title="Customers"
        description="Manage customers for your company."
        tooltip="Search customers by name, email, phone. View details and manage status."
      >
        <Button onClick={() => setIsBulkOpen(true)}>
          <LuImport size={16} /> Import
        </Button>
        <Button onClick={() => setOpen(true)}>
          <FaPlus /> Add Customer
        </Button>
      </PageHeader>

      <section className="mt-10">
        <DataTable
          columns={adminCustomersColumns}
          data={rows}
          onRowClick={(customer) => {
            if (customer.entityType === "subscriber") return;
            router.push(`/customers/${customer.id}`);
          }}
          filterKey="search"
          filterPlaceholder="Search by name, email, phone, status…"
          toolbarLeft={
            <FilterChips<CustomerTab>
              value={tab}
              onChange={setTab}
              chips={chips}
              wrap
            />
          }
        />
      </section>

      <CustomerBulkUploadModal
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        endpoint={`/api/admin/customers/bulk/${activeStoreId ?? "null"}`}
        onSuccess={() => refetch()}
      />
      <CreateCustomerModal open={open} onClose={() => setOpen(false)} />
    </section>
  );
}
