"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs";
import { BsFillBoxSeamFill } from "react-icons/bs";
import { FaTag, FaReceipt } from "react-icons/fa";
import { ProductTable } from "./core/ui/product-table";
import { CategoriesClient } from "./categories/ui/category-client";
import { ReviewsTable } from "./reviews/ui/reviews-table";
import PageHeader from "@/shared/ui/page-header";

type ProductTabKey = "products" | "collections" | "reviews";

const DEFAULT_TAB: ProductTabKey = "products";

export default function ProductClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlTab = searchParams.get("tab") as ProductTabKey | null;
  const [tab, setTab] = useState<ProductTabKey>(urlTab ?? DEFAULT_TAB);

  // Keep state in sync with browser navigation
  useEffect(() => {
    if (urlTab && urlTab !== tab) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTab(urlTab);
    }
  }, [tab, urlTab]);

  const onTabChange = (next: ProductTabKey) => {
    setTab(next);
    router.replace(`?tab=${next}`, { scroll: false });
  };

  return (
    <>
      <PageHeader
        title="Products"
        description="View and search through your catalog products."
        tooltip="Products are the items you sell. Click into one to manage variants, images, and links."
      />

      <Tabs value={tab} onValueChange={(v) => onTabChange(v as ProductTabKey)}>
        <TabsList>
          <TabsTrigger value="products" className="text-base">
            <BsFillBoxSeamFill className="mr-2" />
            Products
          </TabsTrigger>

          <TabsTrigger value="collections" className="text-base">
            <FaTag className="mr-2" />
            Collections
          </TabsTrigger>

          <TabsTrigger value="reviews" className="text-base">
            <FaReceipt className="mr-2" />
            Reviews
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-4">
          <ProductTable />
        </TabsContent>

        <TabsContent value="collections" className="mt-4">
          <CategoriesClient />
        </TabsContent>

        <TabsContent value="reviews" className="mt-4">
          <ReviewsTable />
        </TabsContent>
      </Tabs>
    </>
  );
}
