export interface TaxSettings {
  pricesIncludeTax: boolean;
  chargeTax: boolean;

  defaultCountry: string;
  defaultState: string;

  roundingStrategy: "per_line" | "per_order";

  enableVat: boolean;
  vatDefaultRate: number;
}
