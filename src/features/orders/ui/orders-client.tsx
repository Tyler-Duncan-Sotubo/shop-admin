// features/orders/components/orders-client.tsx
"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import PageHeader from "@/shared/ui/page-header";
import Loading from "@/shared/ui/loading";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import type { ListOrdersParams } from "../types/order.type";
import { useGetOrders } from "../hooks/use-orders";
import { useOrderCountsForTabs } from "../hooks/use-order-counts";
import { ORDER_TAB_TO_STATUS, OrderTab } from "../constants/order-tabs";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import { CreateManualOrderButton } from "./open-manual-orders-button";
import { TabLabel } from "@/shared/ui/tab-label";
import { DataTable } from "@/shared/ui/data-table";
import { orderColumns } from "./order-columns";
import { OrdersMobileRow } from "./orders-mobile-row";
import { FilterChip, FilterChips } from "@/shared/ui/filter-chips";
import { useAuthPermissions } from "@/lib/auth/use-permissions";
import { useOrderPermissions } from "../hooks/use-order-permissions";

const VALID_TABS: OrderTab[] = [
  "draft",
  "on_hold",
  "lay_buy",
  "paid",
  "fulfilled",
  "cancelled",
  "all",
];

function isValidTab(value: string | null): value is OrderTab {
  return VALID_TABS.includes(value as OrderTab);
}

export default function OrdersClient() {
  const { permissions, session, status: authStatus } = useAuthPermissions();
  const axios = useAxiosAuth();
  const { activeStoreId } = useStoreScope();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { canCreateManual } = useOrderPermissions(permissions);

  // Read tab from URL, fall back to "draft"
  const statusParam = searchParams.get("status");
  const tab: OrderTab = isValidTab(statusParam) ? statusParam : "draft";

  // Write tab back to URL
  const setTab = (value: OrderTab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("status", value);
    router.replace(`/sales/orders?${params.toString()}`);
  };

  const counts = useOrderCountsForTabs(session, axios, activeStoreId);

  const params = useMemo<ListOrdersParams>(
    () => ({
      limit: 50,
      offset: 0,
      status: ORDER_TAB_TO_STATUS[tab],
      storeId: activeStoreId,
    }),
    [tab, activeStoreId],
  );

  const { data, isLoading } = useGetOrders(session, axios, params);

  if (authStatus === "loading") return <Loading />;

  const rows = data?.rows ?? [];

  const orderChips: FilterChip<OrderTab>[] = [
    { value: "all", label: "All", count: counts.all },
    { value: "draft", label: "Draft", count: counts.draft },
    { value: "on_hold", label: "On hold", count: counts.onHold },
    { value: "paid", label: "Paid", count: counts.paid, showZero: false },
    {
      value: "lay_buy",
      label: "Lay-buy",
      count: counts.layBuy,
      showZero: false,
    },
    {
      value: "fulfilled",
      label: "Fulfilled",
      count: counts.fulfilled,
      showZero: false,
    },
    {
      value: "cancelled",
      label: "Cancelled",
      count: counts.cancelled,
      showZero: false,
    },
  ];

  const EMPTY_STATE: Record<OrderTab, { title: string; description: string }> =
    {
      draft: {
        title: "No draft orders",
        description:
          "Manually created orders that haven't been submitted yet will appear here.",
      },
      on_hold: {
        title: "No orders on hold",
        description: "Unpaid orders waiting for payment will appear here.",
      },
      paid: {
        title: "No paid orders",
        description: "Orders with confirmed payment will appear here.",
      },
      fulfilled: {
        title: "No fulfilled orders",
        description: "Shipped or delivered orders will appear here.",
      },
      cancelled: {
        title: "No cancelled orders",
        description: "Cancelled orders will appear here.",
      },
      all: {
        title: "No orders yet",
        description:
          "Orders will appear here once customers start placing them.",
      },
      lay_buy: {
        title: "No lay-buy orders",
        description:
          "Orders being fulfilled before payment is collected will appear here.",
      },
    };

  const empty = EMPTY_STATE[tab];

  return (
    <section className="space-y-6 w-full">
      <PageHeader
        title="Orders"
        description="View and manage customer orders."
        tooltip="On hold = unpaid orders. Paid = payment received. Fulfilled = shipped/delivered."
      >
        {canCreateManual && <CreateManualOrderButton />}
      </PageHeader>

      <Tabs value={tab} onValueChange={(v) => setTab(v as OrderTab)}>
        <DataTable
          columns={orderColumns}
          data={isLoading ? [] : rows}
          filterKey="orderNumber"
          filterPlaceholder="Search by order #, id, address..."
          onRowClick={(order) => router.push(`/sales/orders/${order.id}`)}
          mobileRow={OrdersMobileRow}
          emptyState={{
            title: empty.title,
            description: empty.description,
            action: canCreateManual ? <CreateManualOrderButton /> : undefined,
          }}
          toolbarLeft={
            <>
              <FilterChips<OrderTab>
                value={tab}
                onChange={setTab}
                chips={orderChips}
                wrap
              />

              <div className="hidden sm:block w-full sm:w-auto overflow-x-auto">
                <TabsList className="w-max whitespace-nowrap">
                  <TabsTrigger value="draft">
                    <TabLabel label="Draft" count={counts.draft} />
                  </TabsTrigger>
                  <TabsTrigger value="on_hold">
                    <TabLabel label="On hold" count={counts.onHold} />
                  </TabsTrigger>
                  <TabsTrigger value="lay_buy">
                    <TabLabel
                      label="Lay Buy"
                      count={counts.layBuy}
                      showZero={false}
                    />
                  </TabsTrigger>
                  <TabsTrigger value="paid">
                    <TabLabel
                      label="Paid"
                      count={counts.paid}
                      showZero={false}
                    />
                  </TabsTrigger>
                  <TabsTrigger value="fulfilled">
                    <TabLabel
                      label="Fulfilled"
                      count={counts.fulfilled}
                      showZero={false}
                    />
                  </TabsTrigger>
                  <TabsTrigger value="cancelled">
                    <TabLabel
                      label="Cancelled"
                      count={counts.cancelled}
                      showZero={false}
                    />
                  </TabsTrigger>
                  <TabsTrigger value="all">
                    <TabLabel label="All" count={counts.all} />
                  </TabsTrigger>
                </TabsList>
              </div>
            </>
          }
        />

        {isLoading && (
          <div className="mt-3 text-xs text-muted-foreground">Loading…</div>
        )}
      </Tabs>
    </section>
  );
}
