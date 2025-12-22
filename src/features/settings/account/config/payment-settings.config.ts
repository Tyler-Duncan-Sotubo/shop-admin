// src/features/company-settings/payments/config/payment-settings.config.ts

export const paymentProviderOptions = [
  { label: "Paystack", value: "paystack" },
  { label: "Flutterwave", value: "flutterwave" },
  { label: "Stripe", value: "stripe" },
];

export const manualPaymentOptions = [
  { label: "Bank Transfer", value: "bank_transfer" },
  { label: "Cash on Delivery", value: "cod" },
];
