// type
export interface PaymentSettings {
  enabledProviders: string[];
  defaultProvider: string;
  manualPaymentMethods: string[];
  allowPartialPayments: boolean;
}

export type PaymentSettingsApi = {
  enabled_providers: string[];
  default_provider: string;
  manual_payment_methods: string[];
  allow_partial_payments: boolean;
};
