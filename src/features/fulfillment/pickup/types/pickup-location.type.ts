/* eslint-disable @typescript-eslint/no-explicit-any */
// features/pickup/types/pickup-location.type.ts
export type PickupLocation = {
  id: string;
  name: string;
  isActive: boolean;
  inventoryLocationId: string | null;
  address: Record<string, any> | null;
  instructions?: string | null;
  createdAt?: string;
  updatedAt?: string;
  inventoryName: string;
  address1?: string;
  address2?: string | null;
  state: string | null;
};

export type CreatePickupLocationInput = {
  name: string;
  inventoryLocationId?: string | null;
  address?: Record<string, any> | null;
  instructions?: string | null;
  isActive?: boolean | null;
};

export type UpdatePickupLocationInput = Partial<CreatePickupLocationInput>;
