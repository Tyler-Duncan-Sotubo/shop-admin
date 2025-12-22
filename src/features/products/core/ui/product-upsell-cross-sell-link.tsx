"use client";

import { ProductMultiSelect } from "./product-multi-select";

export function ProductUpsellCrossSellLinks({
  searchEndpoint = "/api/catalog/products",
  className,
}: {
  searchEndpoint?: string;
  className?: string;
}) {
  return (
    <div className={className ?? "space-y-4"}>
      <ProductMultiSelect
        name="links.upsell"
        label="Upsells"
        description="Higher-value alternatives/upgrades"
        placeholder="Search upsell products..."
        searchEndpoint={searchEndpoint}
      />

      <ProductMultiSelect
        name="links.cross_sell"
        label="Cross-sells"
        description="Frequently bought together"
        placeholder="Search cross-sell products..."
        searchEndpoint={searchEndpoint}
      />
    </div>
  );
}
