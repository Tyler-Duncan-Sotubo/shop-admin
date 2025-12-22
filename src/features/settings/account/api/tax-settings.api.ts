import { AxiosInstance } from "axios";
import { TaxSettings } from "../types/tax-settings.type";

type TaxSettingsApi = {
  prices_include_tax: boolean;
  charge_tax: boolean;
  default_country: string;
  default_state: string;
  rounding_strategy: "per_line" | "per_order";
  enable_vat: boolean;
  vat_default_rate: number;
};

// ----- snake → camel -----
const mapFromApi = (raw: TaxSettingsApi): TaxSettings => ({
  pricesIncludeTax: raw.prices_include_tax ?? false,
  chargeTax: raw.charge_tax ?? true,
  defaultCountry: raw.default_country ?? "",
  defaultState: raw.default_state ?? "",
  roundingStrategy: raw.rounding_strategy ?? "per_line",
  enableVat: raw.enable_vat ?? false,
  vatDefaultRate: raw.vat_default_rate ?? 0,
});

// ----- camel → snake with prefix -----
const mapToApiKey = (key: keyof TaxSettings) => {
  const map: Record<keyof TaxSettings, string> = {
    pricesIncludeTax: "prices_include_tax",
    chargeTax: "charge_tax",
    defaultCountry: "default_country",
    defaultState: "default_state",
    roundingStrategy: "rounding_strategy",
    enableVat: "enable_vat",
    vatDefaultRate: "vat_default_rate",
  };

  return `tax.${map[key]}`;
};

export const fetchTaxSettings = async (
  axios: AxiosInstance
): Promise<TaxSettings> => {
  const res = await axios.get("/api/company-settings/tax");

  return mapFromApi(res.data?.data as TaxSettingsApi);
};

export const updateTaxSetting = async (
  axios: AxiosInstance,
  key: keyof TaxSettings,
  value: unknown,
  accessToken?: string
) => {
  const prefixed = mapToApiKey(key);

  await axios.patch(
    "/api/company-settings",
    { key: prefixed, value },
    accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : undefined
  );
};
