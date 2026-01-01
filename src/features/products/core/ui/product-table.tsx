"use client";

import { useMemo, useState } from "react";
import { DataTable } from "@/shared/ui/data-table";
import Loading from "@/shared/ui/loading";
import PageHeader from "@/shared/ui/page-header";
import { productColumns } from "./product-columns";
import type { ProductListRow } from "../types/product.type";
import { useGetProducts } from "../hooks/use-product";
import { useSession } from "next-auth/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { TabLabel } from "@/shared/ui/tab-label";
import { useProductCountsForTabs } from "../hooks/use-product-counts";

type StatusTab = "active" | "draft" | "archived";

export function ProductTable({ data = [] }: { data?: ProductListRow[] }) {
  const { data: session, status: authStatus } = useSession();
  const axios = useAxiosAuth();
  const { activeStoreId } = useStoreScope();

  const [statusTab, setStatusTab] = useState<StatusTab>("active");

  // ✅ query for current tab
  const query = useMemo(
    () => ({
      storeId: activeStoreId || undefined,
      limit: 50,
      offset: 0,
      // backend default status is "active" when status is undefined
      status: statusTab === "active" ? undefined : statusTab,
    }),
    [statusTab, activeStoreId]
  );

  // ✅ list (rows + total)
  const { data: list, isLoading: isListLoading } = useGetProducts(
    query,
    session
  );

  // ✅ tab counts (all/active/archived/draft)
  const { counts, isLoading: isCountsLoading } = useProductCountsForTabs(
    session,
    axios,
    {
      storeId: activeStoreId || undefined,
      statuses: [
        { key: "active", status: "active" },
        { key: "draft", status: "draft" },
        { key: "archived", status: "archived" },
      ],
    }
  );

  if (authStatus === "loading" || isListLoading || isCountsLoading)
    return <Loading />;

  // if server data passed in, use it; otherwise use query result
  const rows = data.length ? data : list?.rows ?? [];

  return (
    <section className="space-y-4">
      {!data.length && (
        <PageHeader
          title="Products"
          description="View and search through your catalog products."
          tooltip="Products are the items you sell. Click into one to manage variants, images, and links."
        />
      )}

      {!data.length ? (
        <Tabs
          value={statusTab}
          onValueChange={(v) => setStatusTab(v as StatusTab)}
        >
          <TabsList>
            <TabsTrigger value="active">
              <TabLabel
                label="Published"
                count={counts.active ?? 0}
                // showZero={true} // default
              />
            </TabsTrigger>

            <TabsTrigger value="draft">
              <TabLabel label="Draft" count={counts.draft ?? 0} />
            </TabsTrigger>

            <TabsTrigger value="archived">
              <TabLabel label="Archived" count={counts.archived ?? 0} />
            </TabsTrigger>
          </TabsList>

          <TabsContent value={statusTab} className="mt-4">
            <DataTable
              columns={productColumns}
              data={rows}
              filterKey="name"
              filterPlaceholder="Search by product name..."
            />
          </TabsContent>
        </Tabs>
      ) : (
        <DataTable
          columns={productColumns}
          data={rows}
          filterKey="name"
          filterPlaceholder="Search by product name..."
        />
      )}
    </section>
  );
}
