"use client";

import { useMemo, useState } from "react";
import { Preset, usePresetRange } from "../../core/hooks/use-preset-range";
import { useCommerceTopProducts } from "../../overview/hooks/use-commerce-overview";
import { TopProductsDataTable } from "./top-products-table";
import { CommerceTopProductRow } from "../../overview/types/commerce-analytics.type";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { usePersistedState } from "../../core/hooks/use-persisted-state";
import { useSession } from "next-auth/react";
import { useStoreScope } from "@/lib/providers/store-scope-provider";
import Loading from "@/shared/ui/loading";
import PageHeader from "@/shared/ui/page-header";

export function CommerceTopProductsTable() {
  const { data: session } = useSession();
  const { activeStoreId } = useStoreScope();

  const [preset, setPreset] = usePersistedState<Preset>(
    "analytics:commerce-top-products-preset",
    "30d"
  );

  const range = usePresetRange(preset);

  const [by, setBy] = useState<"revenue" | "units">("revenue");
  const q = useCommerceTopProducts(
    { ...range, by, limit: 50, storeId: activeStoreId },
    session
  );

  const rows: CommerceTopProductRow[] = useMemo(() => {
    const data = q.data ?? [];
    return data.map((r) => ({
      productId: r.productId ?? null,
      variantId: r.variantId ?? null,
      productName: r.productName ?? null,
      variantTitle: r.variantTitle ?? null,
      quantity: r.quantity ?? 0,
      revenueMinor: r.revenueMinor ?? 0,
      imageUrl: r.imageUrl ?? null,
      currency: r.currency ?? "NGN",
      categories: r.categories ?? [],
      price: r.price ?? "0.00",
    }));
  }, [q.data]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <PageHeader
            title="Top Products"
            description="Overview of top selling products"
          />
        </div>
      </div>

      {q.isLoading ? (
        <div className="py-6 text-sm text-muted-foreground">
          <Loading />
        </div>
      ) : (
        <TopProductsDataTable
          data={rows}
          toolbarRight={
            <div className="flex flex-row items-center gap-2">
              {/* Date preset select */}
              <Select
                value={preset}
                onValueChange={(v) => setPreset(v as Preset)}
              >
                <SelectTrigger className="h-8 w-[140px]">
                  <SelectValue placeholder="Date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort select */}
              <Select
                value={by}
                onValueChange={(v) => setBy(v as "revenue" | "units")}
              >
                <SelectTrigger className="h-8 w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="units">Quantity</SelectItem>
                </SelectContent>
              </Select>
            </div>
          }
        />
      )}
    </div>
  );
}
