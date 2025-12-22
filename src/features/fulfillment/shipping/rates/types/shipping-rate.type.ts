export type ShippingRateCalc = "flat" | "weight";

export type ShippingRate = {
  id: string;
  zoneId: string;
  carrierId: string | null;

  name: string;
  calc: ShippingRateCalc;

  flatAmount: string | null; // Money as string
  isDefault: boolean;
  isActive: boolean;
  priority: number;

  minDeliveryDays: number | null;
  maxDeliveryDays: number | null;

  createdAt?: string;
  updatedAt?: string;
};
