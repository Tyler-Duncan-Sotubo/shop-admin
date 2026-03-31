// features/orders/components/orders-client.tsx
"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
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

export default function OrdersClient() {
  const { data: session, status: authStatus } = useSession();
  const axios = useAxiosAuth();
  const { activeStoreId } = useStoreScope();

  const [tab, setTab] = useState<OrderTab>("draft");

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

  // ✅ don’t block the whole UI while switching filters; only block while auth loads
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
    }, // 👈
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
        <CreateManualOrderButton />
      </PageHeader>

      <Tabs value={tab} onValueChange={(v) => setTab(v as OrderTab)}>
        <DataTable
          columns={orderColumns}
          data={isLoading ? [] : rows} // rows can be []
          filterKey="orderNumber"
          filterPlaceholder="Search by order #, id, address..."
          mobileRow={OrdersMobileRow}
          emptyState={{
            title: empty.title,
            description: empty.description,
            action: <CreateManualOrderButton />,
          }}
          toolbarLeft={
            <>
              {/* Mobile dropdown, desktop scroll tabs (recommended) */}
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

        {/* Loading state can be shown separately if you want */}
        {isLoading ? (
          <div className="mt-3 text-xs text-muted-foreground">Loading…</div>
        ) : null}
      </Tabs>
    </section>
  );
}
