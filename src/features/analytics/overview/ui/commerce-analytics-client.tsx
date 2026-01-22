"use client";

import PageHeader from "@/shared/ui/page-header";
import { CommerceSalesCards } from "./commerce-sales-cards";
import { CommerceSalesChart } from "./commerce-sales-chart";
import { useSession } from "next-auth/react";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import { CommerceOrdersByChannelPie } from "./commerce-order-by-channel";

export function CommerceAnalyticsClient() {
  const { data: session } = useSession();
  const { activeStoreId } = useStoreScope();
  return (
    <div className="space-y-10">
      <PageHeader
        title="Business Overview"
        description="Sales, orders, customers, and store traffic."
      />

      {/* 1) Cards (has its own preset buttons) */}
      <CommerceSalesCards session={session} activeStoreId={activeStoreId} />

      {/* 2) Chart (has its own range buttons: 7D/30D/1Y) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 items-stretch">
        <div className="md:col-span-2">
          <CommerceSalesChart session={session} activeStoreId={activeStoreId} />
        </div>

        <div className="md:col-span-1">
          <CommerceOrdersByChannelPie
            session={session}
            activeStoreId={activeStoreId}
          />
        </div>
      </div>
    </div>
  );
}
