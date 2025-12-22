export type ShippingZone = {
  id: string;
  name: string;
  priority: number;
  isActive: boolean;
  createdAt: string;
};

export type CreateZoneInput = {
  name: string;
  priority?: number;
  isActive?: boolean;
};

export type ZoneLocation = {
  id: string;
  countryCode: string;
  state: string | null;
  area: string | null;
};
