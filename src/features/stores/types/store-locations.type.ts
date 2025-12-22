export type InventoryLocation = {
  id: string;
  storeId: string;

  name: string;
  code: string | null;
  type: string;

  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  region: string | null;
  postalCode: string | null;
  country: string | null;

  isActive: boolean;

  createdAt: string;
  updatedAt: string;

  isPrimary: boolean;
};

export type StoreLocation = {
  storeId: string;
  locationId: string;
  isPrimary: boolean;
  isActive: boolean;
  location: InventoryLocation;
};

export type UpdateStoreLocationsPayload = {
  locationIds: string[];
};

export type StoreLocationsModalProps = {
  open: boolean;

  /** All company inventory locations (warehouse + retail) */
  allLocations: InventoryLocation[];

  /** Currently assigned location IDs for the store */
  assignedLocationIds: string[];

  /** Close modal handler */
  onClose: () => void;

  /**
   * Submit selected location IDs
   * Modal does not know about storeId or API
   */
  onSubmit: (locationIds: string[]) => Promise<void>;
  submitError: string | null;
};
