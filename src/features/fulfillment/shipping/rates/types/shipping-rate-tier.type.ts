export type ShippingRateTier = {
  id: string;
  rateId: string;

  minWeightGrams: number | null;
  maxWeightGrams: number | null;

  amount: string; // Money as string
  priority: number;

  createdAt?: string;
  updatedAt?: string;
};
