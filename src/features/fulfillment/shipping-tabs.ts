import type { FilterChip } from "@/shared/ui/filter-chips";

export type ShippingTab = "options" | "pickup";

export const SHIPPING_TAB_CHIPS: FilterChip<ShippingTab>[] = [
  { value: "options", label: "Shipping Options" },
  { value: "pickup", label: "Pickup" },
];
