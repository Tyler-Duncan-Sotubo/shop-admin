export type ShippingZoneLocation = {
  id: string;
  countryCode: string;
  regionCode: string | null; // state
  area: string | null;
  zoneName: string;
};

export type UpsertZoneLocationInput = {
  zoneId: string;
  countryCode?: string; // default NG
  state?: string | null;
  area?: string | null;
};
