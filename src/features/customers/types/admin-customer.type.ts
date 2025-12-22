export type AdminCustomerRow = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  isVerified: boolean;
  isActive: boolean;
  marketingOptIn: boolean;
  createdAt: string;
  lastLogin: string | null;
};

export type CustomerAddress = {
  id: string;
  label: string | null;
  firstName: string | null;
  lastName: string | null;
  line1: string | null;
  line2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  phone: string | null;
  isDefaultBilling: boolean | null;
  isDefaultShipping: boolean | null;
};

export type CreateAddressPayload = {
  label?: string;
  firstName?: string;
  lastName?: string;
  line1: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  isDefaultBilling?: boolean;
  isDefaultShipping?: boolean;
};

export type CustomerDetail = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  marketingOptIn: boolean | null;
  isActive: boolean | null;
  createdAt?: string | Date | null;
  lastLogin?: string | Date | null;
  addresses?: CustomerAddress[];
};

export type UpdateCustomerPayload = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  marketingOptIn?: boolean;
  isActive?: boolean;
};
