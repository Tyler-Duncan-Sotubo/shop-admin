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

export default function AdminCustomersClient() {
  const axios = useAxiosAuth();
  const { data: session, status: authStatus } = useSession();
  const [includeInactive, setIncludeInactive] = useState(false);
  const [open, setOpen] = useState(false);

  const query = useMemo(
    () => ({
      limit: 50,
      offset: 0,
      includeInactive,
    }),
    [includeInactive]
  );

  const { data: customers = [], isLoading } = useAdminCustomers(
    query,
    session,
    axios
  );

  // ─────────────────────────────────────────────
  // Loading
  // ─────────────────────────────────────────────
  if (authStatus === "loading" || isLoading) {
    return <Loading />;
  }

  // ─────────────────────────────────────────────
  // Empty state: no customers at all
  // ─────────────────────────────────────────────
  if (customers.length === 0 && !includeInactive) {
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
        />
        <CreateCustomerModal open={open} onClose={() => setOpen(false)} />
      </section>
    );
  }

  // ─────────────────────────────────────────────
  // Normal render
  // ─────────────────────────────────────────────
  return (
    <section className="space-y-4">
      <PageHeader
        title="Customers"
        description="Manage customers for your company."
        tooltip="Search customers by name, email, phone. View details and manage status."
      >
        <Button onClick={() => setOpen(true)}>
          <FaPlus /> Add Customer{" "}
        </Button>
      </PageHeader>
      <div className="flex items-center justify-end gap-2">
        <Switch
          checked={includeInactive}
          onCheckedChange={setIncludeInactive}
        />
        <Label className="text-sm">Include inactive</Label>
      </div>

      <DataTable
        columns={adminCustomersColumns}
        data={customers}
        filterKey="search"
        filterPlaceholder="Search by name, email, phone, status…"
      />

      <CreateCustomerModal open={open} onClose={() => setOpen(false)} />
    </section>
  );
}
