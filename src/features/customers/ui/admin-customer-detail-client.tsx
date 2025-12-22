"use client";

import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import Loading from "@/shared/ui/loading";
import PageHeader from "@/shared/ui/page-header";
import { useAdminCustomerDetail } from "../hooks/use-admin-customers";
import { CustomerDetailsCard } from "./customer-details-card";
import { CustomerAddressesCard } from "./customer-addresses-card";

type Props = {
  customerId: string;
};

export default function AdminCustomerDetailClient({ customerId }: Props) {
  const axios = useAxiosAuth();
  const { data: session, status } = useSession();

  const { data, isLoading, isError, error } = useAdminCustomerDetail(
    customerId,
    session,
    axios
  );

  if (isLoading || status === "loading") {
    return <Loading />;
  }

  if (isError || !data) {
    return (
      <div>
        Error loading customer detail: {(error as Error)?.message || "Unknown"}
      </div>
    );
  }

  const customer = data;

  return (
    <section className="space-y-4">
      <PageHeader
        title="Customer"
        description="View and manage this customer."
        tooltip="Edit customer details and manage their addresses."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <CustomerDetailsCard customer={customer} />
        </div>

        <div className="lg:col-span-1">
          {/* You can add extra sidebar cards here later */}
        </div>
      </div>

      <CustomerAddressesCard customer={customer} />
    </section>
  );
}
