"use client";

import { useMemo, useState } from "react";
import { DataTable } from "@/shared/ui/data-table";
import Loading from "@/shared/ui/loading";
import { productColumns } from "./product-columns";
import type { ProductListRow } from "../types/product.type";
import { useGetProducts } from "../hooks/use-product";
import { useSession } from "next-auth/react";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import useAxiosAuth from "@/shared/hooks/use-axios-auth";
import { TabLabel } from "@/shared/ui/tab-label";
import { useProductCountsForTabs } from "../hooks/use-product-counts";
import { Button } from "@/shared/ui/button";
import { FaPlus } from "react-icons/fa6";
import Link from "next/link";

import { FilterChips, type FilterChip } from "@/shared/ui/filter-chips";
import { ProductsMobileRow } from "./products-mobile-row";
import { ExportMenu } from "@/shared/ui/export-menu";

type StatusTab = "active" | "draft" | "archived";

export function ProductTable({ data = [] }: { data?: ProductListRow[] }) {
  const { data: session, status: authStatus } = useSession();
  const axios = useAxiosAuth();
  const { activeStoreId } = useStoreScope();

  const [statusTab, setStatusTab] = useState<StatusTab>("active");

  const query = useMemo(
    () => ({
      storeId: activeStoreId || undefined,
      limit: 500,
      offset: 0,
      status: statusTab === "active" ? undefined : statusTab,
    }),
    [statusTab, activeStoreId],
  );

  const { data: list, isLoading: isListLoading } = useGetProducts(
    query,
    session,
  );

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
    },
  );

  if (authStatus === "loading" || isListLoading || isCountsLoading) {
    return <Loading />;
  }

  const rows = data.length ? data : (list?.rows ?? []);

  // only show the “Add Product” button when this is the main page table
  const toolbarRight = !data.length ? (
    <>
      <Link href="/products/new?tab=products">
        <Button className="w-full">
          <FaPlus /> Add Product
        </Button>
      </Link>
      <ExportMenu
        exportPath="/api/catalog/products/export-products"
        query={{
          storeId: activeStoreId || undefined,
          status: "active",
        }}
      />
    </>
  ) : null;

  const chips: FilterChip<StatusTab>[] = [
    { value: "active", label: "Published", count: counts.active ?? 0 },
    { value: "draft", label: "Draft", count: counts.draft ?? 0 },
    { value: "archived", label: "Archived", count: counts.archived ?? 0 },
  ];

  return (
    <Tabs value={statusTab} onValueChange={(v) => setStatusTab(v as StatusTab)}>
      <DataTable
        columns={productColumns}
        data={rows}
        filterKey="name"
        filterPlaceholder="Search by product name..."
        mobileRow={ProductsMobileRow}
        toolbarLeft={
          !data.length ? (
            <>
              {/* ✅ Mobile chips */}
              <FilterChips<StatusTab>
                value={statusTab}
                onChange={setStatusTab}
                chips={chips}
                wrap
              />

              {/* ✅ Desktop tabs */}
              <div className="hidden sm:block">
                <TabsList>
                  <TabsTrigger value="active">
                    <TabLabel label="Published" count={counts.active ?? 0} />
                  </TabsTrigger>
                  <TabsTrigger value="draft">
                    <TabLabel label="Draft" count={counts.draft ?? 0} />
                  </TabsTrigger>
                  <TabsTrigger value="archived">
                    <TabLabel label="Archived" count={counts.archived ?? 0} />
                  </TabsTrigger>
                </TabsList>
              </div>
            </>
          ) : null
        }
        toolbarRight={toolbarRight}
      />
    </Tabs>
  );
}
