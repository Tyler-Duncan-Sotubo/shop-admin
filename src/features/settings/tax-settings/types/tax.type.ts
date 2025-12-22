export type Tax = {
  id: string;
  name: string;
  code?: string | null;

  rateBps: number; // backend canonical
  isInclusive?: boolean;
  isDefault?: boolean;
  isActive?: boolean;

  createdAt?: string;
  updatedAt?: string;
};

// what we send to backend
export type CreateTaxInput = {
  name: string;
  code?: string | null;
  rateBps: number;
  isInclusive?: boolean;
  isDefault?: boolean;
  isActive?: boolean;
};

export type UpdateTaxInput = Partial<CreateTaxInput>;
