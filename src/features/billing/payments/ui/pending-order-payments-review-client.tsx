"use client";

import { useSession } from "next-auth/react";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import Loading from "@/shared/ui/loading";
import PageHeader from "@/shared/ui/page-header";
import { Button } from "@/shared/ui/button";
import { DataTable } from "@/shared/ui/data-table";
import Link from "next/link";
import { useGetPendingOrderPaymentsForReview } from "../hooks/use-payments";

export function PendingOrderPaymentsReviewClient() {
  const { data: session } = useSession();
  const axios = useAxiosAuth();

  const { data: rows = [], isLoading } = useGetPendingOrderPaymentsForReview(
    session,
    axios,
  );

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Pending Bank Transfer Reviews"
        description="Review uploaded proof and approve order payments."
      />

      <div className="mt-6">
        <DataTable
          columns={[
            {
              accessorKey: "orderNumber",
              header: "Order",
            },
            {
              accessorKey: "amountMinor",
              header: "Amount",
              cell: ({ row }) =>
                `${row.original.amountMinor} ${row.original.currency}`,
            },
            {
              accessorKey: "reference",
              header: "Reference",
              cell: ({ row }) => row.original.reference ?? "—",
            },
            {
              accessorKey: "createdAt",
              header: "Date",
              cell: ({ row }) =>
                row.original.createdAt
                  ? new Date(row.original.createdAt).toLocaleDateString()
                  : "—",
            },
            {
              id: "action",
              header: "Action",
              cell: ({ row }) => {
                const paymentId = row.original.paymentId;

                return (
                  <Button asChild variant="outline">
                    <Link
                      href={`/sales/payments/review/${paymentId}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      Review
                    </Link>
                  </Button>
                );
              },
            },
          ]}
          data={rows}
        />
      </div>
    </div>
  );
}
