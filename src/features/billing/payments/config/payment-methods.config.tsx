import React from "react";
import { FaUniversity } from "react-icons/fa";
import { FaMoneyBillWave } from "react-icons/fa";
import { PaymentIntegrationCard } from "../types/payment-methods.type";

export const PAYMENT_METHODS: PaymentIntegrationCard[] = [
  // --------------------
  // ONLINE (Gateway)
  // --------------------
  {
    key: "gateway:paystack",
    category: "online",
    method: "gateway",
    provider: "paystack",
    title: "Paystack",
    description: "Accept card & bank payments via Paystack.",
    icon: "https://centa-hr.s3.amazonaws.com/019b40f4-a8f1-7b26-84d0-45069767fa8c/images.png",
    fields: [
      {
        key: "publicKey",
        label: "Public Key",
        placeholder: "pk_test_...",
        required: true,
        type: "text",
      },
      {
        key: "secretKey",
        label: "Secret Key",
        placeholder: "sk_test_...",
        required: true,
        type: "text",
        secret: true,
      },
    ],
    fromConfig: (row) => ({
      publicKey: row?.config?.publicKey ?? "",
      secretKey: row?.config?.secretKey ?? "",
    }),
    toConfig: (values) => ({
      publicKey: String(values.publicKey ?? "").trim(),
      secretKey: String(values.secretKey ?? "").trim(),
    }),
    enableWarning: {
      title: "Paystack setup required",
      description:
        "You’ll need your Paystack public and secret keys before enabling this payment method.",
      confirmText: "Configure Paystack",
    },
  },

  {
    key: "gateway:stripe",
    category: "online",
    method: "gateway",
    provider: "stripe",
    title: "Stripe",
    description: "Accept card payments via Stripe.",
    icon: "https://centa-hr.s3.amazonaws.com/019b40f4-a8f1-7b26-84d0-45069767fa8c/0x0.png",
    fields: [
      {
        key: "publishableKey",
        label: "Publishable Key",
        placeholder: "pk_test_...",
        required: true,
        type: "text",
      },
      {
        key: "secretKey",
        label: "Secret Key",
        placeholder: "sk_test_...",
        required: true,
        type: "text",
        secret: true,
      },
      {
        key: "webhookSecret",
        label: "Webhook Secret (optional)",
        placeholder: "whsec_...",
        required: false,
        type: "text",
        secret: true,
      },
    ],
    fromConfig: (row) => ({
      publishableKey: row?.config?.publishableKey ?? "",
      secretKey: row?.config?.secretKey ?? "",
      webhookSecret: row?.config?.webhookSecret ?? "",
    }),
    toConfig: (values) => ({
      publishableKey: String(values.publishableKey ?? "").trim(),
      secretKey: String(values.secretKey ?? "").trim(),
      webhookSecret: String(values.webhookSecret ?? "").trim() || null,
    }),
  },

  {
    key: "gateway:fincra",
    category: "online",
    method: "gateway",
    provider: "fincra",
    title: "Fincra",
    description: "Accept payments via Fincra (cards, transfers, local rails).",
    icon: "https://centa-hr.s3.amazonaws.com/019b40f4-a8f1-7b26-84d0-45069767fa8c/images (1).png",
    fields: [
      {
        key: "publicKey",
        label: "Public Key",
        placeholder: "e.g. FINCRA_PUBLIC_KEY",
        required: true,
        type: "text",
      },
      {
        key: "secretKey",
        label: "Secret Key",
        placeholder: "e.g. FINCRA_SECRET_KEY",
        required: true,
        type: "text",
        secret: true,
      },
      {
        key: "businessId",
        label: "Business ID (optional)",
        placeholder: "e.g. fincra_business_id",
        required: false,
        type: "text",
      },
      {
        key: "webhookSecret",
        label: "Webhook Secret (optional)",
        placeholder: "e.g. fincra_webhook_secret",
        required: false,
        type: "text",
        secret: true,
      },
    ],
    fromConfig: (row) => ({
      publicKey: row?.config?.publicKey ?? "",
      secretKey: row?.config?.secretKey ?? "",
      businessId: row?.config?.businessId ?? "",
      webhookSecret: row?.config?.webhookSecret ?? "",
    }),
    toConfig: (values) => ({
      publicKey: String(values.publicKey ?? "").trim(),
      secretKey: String(values.secretKey ?? "").trim(),
      businessId: String(values.businessId ?? "").trim() || null,
      webhookSecret: String(values.webhookSecret ?? "").trim() || null,
    }),
  },

  // --------------------
  // MANUAL
  // --------------------
  {
    key: "bank_transfer",
    category: "manual",
    method: "bank_transfer",
    title: "Bank Transfer",
    description: "Let customers pay by bank transfer and upload evidence.",
    icon: <FaUniversity size={30} color="green" />,
    fields: [
      {
        key: "bankName",
        label: "Bank Name",
        placeholder: "e.g. GTBank",
        required: true,
        type: "text",
      },
      {
        key: "accountName",
        label: "Account Name",
        placeholder: "e.g. Acme Ltd",
        required: true,
        type: "text",
      },
      {
        key: "accountNumber",
        label: "Account Number",
        placeholder: "0123456789",
        required: true,
        type: "text",
      },
      {
        key: "instructions",
        label: "Instructions (optional)",
        placeholder: "e.g. Use your order number as narration",
        type: "textarea",
      },
    ],
    fromConfig: (row) => ({
      bankName: row?.config?.bankDetails?.bankName ?? "",
      accountName: row?.config?.bankDetails?.accountName ?? "",
      accountNumber: row?.config?.bankDetails?.accountNumber ?? "",
      instructions: row?.config?.bankDetails?.instructions ?? "",
    }),
    toConfig: (values) => ({
      bankDetails: {
        bankName: String(values.bankName ?? "").trim(),
        accountName: String(values.accountName ?? "").trim(),
        accountNumber: String(values.accountNumber ?? "").trim(),
        instructions: String(values.instructions ?? "").trim() || null,
      },
    }),
    enableWarning: {
      title: "Bank Transfer requires manual confirmation",
      description:
        "Customers will upload a transfer receipt, and you’ll need to manually verify and mark payments as completed in your dashboard.",
      confirmText: "I understand",
    },
  },

  {
    key: "cash",
    category: "manual",
    method: "cash",
    title: "Cash",
    description: "Accept cash payments (in-person / delivery).",
    icon: <FaMoneyBillWave size={30} color="green" />,
    fields: [],
    fromConfig: () => ({}),
    toConfig: () => ({}),
  },

  {
    key: "pos",
    category: "manual",
    method: "pos",
    title: "POS Terminal",
    description: "Accept card payments via POS terminal (manual confirmation).",
    icon: "https://centa-hr.s3.amazonaws.com/019b40f4-a8f1-7b26-84d0-45069767fa8c/pos-terminal_8560971.png",
    fields: [
      {
        key: "instructions",
        label: "Instructions (optional)",
        placeholder:
          "e.g. Ask customer to keep the POS slip. Use order number as reference.",
        type: "textarea",
      },
    ],
    fromConfig: (row) => ({
      instructions: row?.config?.instructions ?? "",
    }),
    toConfig: (values) => ({
      instructions: String(values.instructions ?? "").trim() || null,
    }),
  },
];
