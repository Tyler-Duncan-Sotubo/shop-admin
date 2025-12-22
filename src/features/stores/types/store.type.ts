// shared/store/types/store.type.ts

import { StoreFormValues } from "../schema/stores.schema";

export type Store = {
  id: string;
  companyId: string;
  name: string;
  slug: string;
  defaultCurrency: string;
  defaultLocale: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateStorePayload = {
  name: string;
  slug: string;
  defaultCurrency?: string;
  defaultLocale?: string;
  isActive?: boolean;
};

export type UpdateStorePayload = Partial<CreateStorePayload>;

export type StoreFormModalProps = {
  open: boolean;
  mode: "create" | "edit";
  store?: Store | null;
  onClose: () => void;
  onSubmit: (values: StoreFormValues) => Promise<void>;
};
