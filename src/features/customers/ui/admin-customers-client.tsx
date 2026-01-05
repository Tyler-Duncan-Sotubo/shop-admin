/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import Loading from "@/shared/ui/loading";
import PageHeader from "@/shared/ui/page-header";
import { DataTable } from "@/shared/ui/data-table";
import { Switch } from "@/shared/ui/switch";
import { Label } from "@/shared/ui/label";
import { EmptyState } from "@/shared/ui/empty-state";

import { useAdminCustomers } from "../hooks/use-admin-customers";
import { adminCustomersColumns } from "./admin-customers-columns";
import { FaUsers } from "react-icons/fa";
import { CreateCustomerModal } from "./create-customer-modal";
import { FaPlus } from "react-icons/fa6";
import { Button } from "@/shared/ui/button";
import BulkUploadModal from "@/shared/ui/bulk-upload-modal";
import { LuImport } from "react-icons/lu";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import type { AdminCustomerRow } from "../types/admin-customer.type";

export default function AdminCustomersClient() {
  const axios = useAxiosAuth();
  const { activeStoreId } = useStoreScope();
  const { data: session, status: authStatus } = useSession();

  const [includeInactive, setIncludeInactive] = useState(false);

  // ✅ NEW: include subscribers toggle
  const [includeSubscribers, setIncludeSubscribers] = useState(true);

  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [open, setOpen] = useState(false);

  const query = useMemo(
    () => ({
      limit: 500,
      offset: 0,
      includeInactive,
      includeSubscribers, // ✅ NEW (hook must support it)
      storeId: activeStoreId,
    }),
    [activeStoreId, includeInactive, includeSubscribers]
  );

  const { data, isLoading } = useAdminCustomers(query, session, axios);

  // ✅ Normalize: support either array response or { rows } response
  const rows: AdminCustomerRow[] = useMemo(() => {
    if (!data) return [];
    const raw = Array.isArray(data) ? data : (data as any).rows ?? [];

    return raw.map((r: any) => ({
      ...r,
      email: r.email ?? r.billingEmail ?? "",
      lastLogin: r.lastLogin ?? r.lastLoginAt ?? null,
      entityType: r.entityType ?? "customer",
      marketingStatus: r.marketingStatus ?? r.status ?? null,
    }));
  }, [data]);

  // Loading
  if (authStatus === "loading" || isLoading) {
    return <Loading />;
  }

  // Empty state
  if (rows.length === 0 && !includeInactive) {
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

        <BulkUploadModal
          isOpen={isBulkOpen}
          onClose={() => setIsBulkOpen(false)}
          title="Bulk Import Customers"
          endpoint={`/api/admin/customers/bulk/${activeStoreId}`}
          refetchKey="customers onboarding"
          successMessage="Customers added successfully"
          exampleDownloadHref="https://res.cloudinary.com/dw1ltt9iz/raw/upload/v1757585682/department_ee9hgy.xlsx"
          exampleDownloadLabel=""
        />

        <CreateCustomerModal open={open} onClose={() => setOpen(false)} />
      </section>
    );
  }

  // Normal render
  return (
    <section className="space-y-4">
      <PageHeader
        title="Customers"
        description="Manage customers for your company."
        tooltip="Search customers by name, email, phone. View details and manage status."
      >
        <Button onClick={() => setIsBulkOpen(true)}>
          <LuImport size={16} />
          Import
        </Button>
        <Button onClick={() => setOpen(true)}>
          <FaPlus /> Add Customer
        </Button>
      </PageHeader>

      <div className="flex items-center justify-end gap-6">
        <div className="flex items-center gap-2">
          <Switch
            checked={includeInactive}
            onCheckedChange={setIncludeInactive}
          />
          <Label className="text-sm">Include inactive</Label>
        </div>

        {/* ✅ NEW */}
        <div className="flex items-center gap-2">
          <Switch
            checked={includeSubscribers}
            onCheckedChange={setIncludeSubscribers}
          />
          <Label className="text-sm">Include subscribers</Label>
        </div>
      </div>

      <DataTable
        columns={adminCustomersColumns}
        data={rows}
        filterKey="search"
        filterPlaceholder="Search by name, email, phone, status…"
      />

      <BulkUploadModal
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        title="Bulk Import Customers"
        endpoint="/api/admin/customers/bulk"
        refetchKey="admin customers"
        successMessage="Customers added successfully"
        exampleDownloadHref="https://res.cloudinary.com/dw1ltt9iz/raw/upload/v1757585682/department_ee9hgy.xlsx"
        exampleDownloadLabel=""
      />

      <CreateCustomerModal open={open} onClose={() => setOpen(false)} />
    </section>
  );
}
