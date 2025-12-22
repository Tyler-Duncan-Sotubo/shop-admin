"use client";

import { useMemo, useState } from "react";
import { DataTable } from "@/shared/ui/data-table";
import Loading from "@/shared/ui/loading";
import PageHeader from "@/shared/ui/page-header";
import { productColumns } from "./product-columns";
import type { ProductListRow } from "../types/product.type";
import { useGetProducts } from "../hooks/use-product";
import { useSession } from "next-auth/react";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs"; // adjust path if needed
import { useStoreScope } from "@/lib/providers/store-scope-provider";

type StatusTab = "all" | "active" | "draft" | "archived";

export function ProductTable({ data = [] }: { data?: ProductListRow[] }) {
  const { data: session, status: authStatus } = useSession();
  const [statusTab, setStatusTab] = useState<StatusTab>("active");
  const { activeStoreId } = useStoreScope(); // ✅ your store scope

  const query = useMemo(
    () => ({
      storeId: activeStoreId, // ✅ REQUIRED
      limit: 50,
      offset: 0,
      status: statusTab === "active" ? undefined : statusTab,
    }),
    [statusTab, activeStoreId]
  );

  const { data: products = [], isLoading } = useGetProducts(query, session);

  if (authStatus === "loading" || isLoading) return <Loading />;

  const rows = data.length ? data : products;

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
            <TabsTrigger value="active">Published</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>

          {/* One content panel is enough since data changes by tab */}
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
        // when external data is passed in, just render table without tabs
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
