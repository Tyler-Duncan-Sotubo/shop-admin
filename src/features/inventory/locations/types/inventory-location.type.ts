import { InventoryLocationFormValues } from "../schema/inventory-locations.schema";

export type InventoryLocation = {
  id: string;
  companyId: string;
  name: string;
  code?: string | null;
  type: "warehouse" | "retail";
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  region?: string | null;
  postalCode?: string | null;
  country?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateInventoryLocationPayload = {
  name: string;
  code?: string | null;
  type: "warehouse" | "retail";
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  region?: string | null;
  postalCode?: string | null;
  country?: string | null;
  isActive?: boolean;
  storeId?: string | null;
};

export type UpdateInventoryLocationPayload =
  Partial<CreateInventoryLocationPayload>;

export type InventoryLocationFormModalProps = {
  open: boolean;
  mode: "create" | "edit";
  location?: InventoryLocation | null;
  onClose: () => void;
  onSubmit: (values: InventoryLocationFormValues) => Promise<void>;
  submitError?: string | null;
};
